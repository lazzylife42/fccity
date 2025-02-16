import express from 'express';
import PocketBase from 'pocketbase';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

const PORT = process.env.PORT || 3000;
const ADMIN_PORT = process.env.ADMIN_PORT || 8090;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const STORE_EMAIL = process.env.STORE_EMAIL;
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

const pb = new PocketBase('http://localhost:8090');
const app = express();

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.static('public'));

// Configuration du transporteur email avec SendGrid
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey', // Ceci est littéral
    pass: SENDGRID_API_KEY // Votre clé SendGrid
  },
  debug: true // Ajoutons ceci pour voir plus de détails
});

// Ajoutons un test de connexion au démarrage
transporter.verify(function(error, success) {
  if (error) {
    console.log('Erreur de configuration email:', error);
  } else {
    console.log('Serveur email prêt à envoyer des messages');
  }
});

const categoryOrder = {
  'Maillot': 1,
  'Short': 2,
  'Bas': 3,
  'Sweat': 4,
  'Pantalon': 5,
  'Jacket': 6,
  'Sac': 7,
};

const getCategoryOrder = (category) => categoryOrder[category] || Infinity;

// Endpoint pour servir les images
app.get('/image-proxy/:collectionId/:id/:filename', async (req, res) => {
  const { collectionId, id, filename } = req.params;
  const imageUrl = `${POCKETBASE_URL}/api/files/${collectionId}/${id}/${filename}`;

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error('Failed to fetch image');
    res.set('Content-Type', imageResponse.headers.get('Content-Type'));
    imageResponse.body.pipe(res);
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).send('Error loading image');
  }
});

// Endpoint pour récupérer les produits
app.get('/api/products', async (req, res) => {
  console.log('Requête reçue avec les paramètres:', req.query);
  const category = req.query.category || '';
  const search = req.query.search || '';
  const kids = req.query.kids === 'true';
  const adult = req.query.adult === 'true';

  let filter = '';
  if (category) filter += `category='${category}'`;
  if (search) filter += `${filter ? ' && ' : ''}name~'${search}'`;
  if (kids) filter += `${filter ? ' && ' : ''}kids=true`;
  if (adult) filter += `${filter ? ' && ' : ''}adult=true`;

  try {
    const products = await pb.collection('articles').getList(1, 50, {
      filter: filter,
    });

    products.items.sort((a, b) => {
      const orderA = getCategoryOrder(a.category);
      const orderB = getCategoryOrder(b.category);
      return orderA - orderB;
    });

    const html = products.items.map(product => {
      const imageUrl = `/image-proxy/${product.collectionId}/${product.id}/${product.image}`;
      return `
        <div class="col-md-3 mb-4" style="display: flex; justify-content: center; align-items: center;">
          <div class="card" style="width: 100%; height: 300px;">
            <img src="${imageUrl}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
            <div class="card-body" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
              <h5 class="card-title">${product.name}</h5>
              <h6 class="card-text truncated-text"><strong>${product.price} CHF</strong></h6>
            </div>
          </div>
        </div>
      `;
    }).join('');

    res.send(html);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
    res.status(500).send("Erreur serveur lors de la récupération des produits");
  }
});

// Endpoint pour soumettre une commande
app.post('/api/submit-order', async (req, res) => {
  const { firstName, lastName, email, address, postalCode, city, phone, orderItems } = req.body;
  
  try {
    const total = orderItems.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('CHF', '').trim());
      return sum + price;
    }, 0);

    const orderDetails = orderItems.map(item => 
      `${item.name} - ${item.price}`
    ).join('\n');

    const emailContent = `
      Nouvelle commande de ${firstName} ${lastName}
      
      Détails de la commande:
      ${orderDetails}
      
      Total: ${total.toFixed(2)} CHF
      
      Informations de livraison:
      Adresse: ${address}
      Code Postal: ${postalCode}
      Ville: ${city}
      Email: ${email}
      Téléphone: ${phone}
    `;

    // Envoi de l'email au magasin
    await transporter.sendMail({
      from: 'storefccity@gmail.com', // L'email vérifié dans SendGrid
      to: STORE_EMAIL,
      subject: `Nouvelle commande - ${firstName} ${lastName}`,
      text: emailContent
    });

    // Envoi de la confirmation au client
    await transporter.sendMail({
      from: 'storefccity@gmail.com', // L'email vérifié dans SendGrid
      to: email,
      subject: 'Confirmation de votre commande - FC City',
      text: `
        Bonjour ${firstName} ${lastName},
        
        Nous avons bien reçu votre commande. Voici un récapitulatif :
        
        ${orderDetails}
        
        Total: ${total.toFixed(2)} CHF
        
        Nous vous contacterons prochainement pour la livraison.
        
        Cordialement,
        FC City
      `
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending order:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
