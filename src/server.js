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
    user: 'apikey',
    pass: SENDGRID_API_KEY
  },
  debug: true
});

// Test de connexion email au démarrage
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
  'autre': 8,
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
		
		// Assurons-nous d'avoir des tailles valides
		let sizes = [];
		if (product.Short_Team_Rise && Array.isArray(product.Short_Team_Rise)) {
		  sizes = product.Short_Team_Rise;
		}
		
		return `
		  <div class="col-md-3 mb-4" style="display: flex; justify-content: center; align-items: center;">
			<div class="card" style="width: 100%; height: 300px;"
				 data-product-id="${product.id}"
				 data-product-name="${product.name}"
				 data-product-price="${product.price}"
				 data-product-image="${imageUrl}"
				 data-product-sizes='${JSON.stringify(sizes)}'>
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

    const orderDetailsHTML = orderItems.map(item =>
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">Taille: ${item.size}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price} CHF</td>
      </tr>`
    ).join('');

    // Template HTML pour le magasin
    const storeEmailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <img src="https://www.fccity.ch/newsite2/wp-content/uploads/cropped-city_logo_70-e1591961364197.png" alt="FC City" style="max-width: 200px; margin-bottom: 20px;">
        <h2 style="color: #005DA5;">Nouvelle commande reçue</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Une nouvelle commande a été passée par ${firstName} ${lastName}
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #005DA5; margin-bottom: 15px;">Détails de la commande</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #005DA5; color: white;">
                <th style="padding: 10px;">Produit</th>
                <th style="padding: 10px;">Taille</th>
                <th style="padding: 10px;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetailsHTML}
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 10px; font-weight: bold;">${total.toFixed(2)} CHF</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <h3 style="color: #005DA5; margin-bottom: 15px;">Informations de livraison</h3>
          <p style="margin: 5px 0;">Adresse: ${address}</p>
          <p style="margin: 5px 0;">Code Postal: ${postalCode}</p>
          <p style="margin: 5px 0;">Ville: ${city}</p>
          <p style="margin: 5px 0;">Email: ${email}</p>
          <p style="margin: 5px 0;">Téléphone: ${phone}</p>
        </div>
      </div>
    `;

    // Template HTML pour le client
    const clientEmailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <img src="https://www.fccity.ch/newsite2/wp-content/uploads/cropped-city_logo_70-e1591961364197.png" alt="FC City" style="max-width: 200px; margin-bottom: 20px;">
        <h2 style="color: #005DA5;">Confirmation de votre commande</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Bonjour ${firstName} ${lastName},<br><br>
          Nous vous remercions pour votre commande. Voici un récapitulatif :
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #005DA5; margin-bottom: 15px;">Détails de votre commande</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #005DA5; color: white;">
                <th style="padding: 10px;">Produit</th>
                <th style="padding: 10px;">Taille</th>
                <th style="padding: 10px;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetailsHTML}
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 10px; font-weight: bold;">${total.toFixed(2)} CHF</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="color: #005DA5; margin-bottom: 15px;">Adresse de facturation</h3>
          <p style="margin: 5px 0;">Adresse: ${address}</p>
          <p style="margin: 5px 0;">Code Postal: ${postalCode}</p>
          <p style="margin: 5px 0;">Ville: ${city}</p>
        </div>

        <p style="font-size: 16px; line-height: 1.5;">
          Nous vous contacterons prochainement pour organiser le retrait de la commande.<br>
          Pour toute question, n'hésitez pas à nous contacter.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 5px 0;">Cordialement,</p>
          <p style="margin: 5px 0; color: #005DA5; font-weight: bold;">L'équipe FC City</p>
        </div>
      </div>
    `;

    // Envoi de l'email au magasin
    await transporter.sendMail({
      from: 'storefccity@gmail.com',
      to: STORE_EMAIL,
      subject: `Nouvelle commande - ${firstName} ${lastName}`,
      html: storeEmailHTML
    });

    // Envoi de la confirmation au client
    await transporter.sendMail({
      from: 'storefccity@gmail.com',
      to: email,
      subject: 'Confirmation de votre commande - FC City',
      html: clientEmailHTML
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending order:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

  // Démarrage du serveur
  app.listen(PORT, () => {
	console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
