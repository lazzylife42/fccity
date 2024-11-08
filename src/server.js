// import express from 'express';
// import PocketBase from 'pocketbase';
// import fetch from 'node-fetch';

// const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');
// const app = express();

// app.use(express.static('public'));

// const categoryOrder = {
//     'Maillot': 1,
//     'Short': 2,
//     'Bas': 3,
//     'Sweat': 4,
//     'Pantalon': 5,
//     'Jacket': 6,
//     'Sac': 7,
// };

// const getCategoryOrder = (category) => categoryOrder[category] || Infinity;

// // Nouvel endpoint pour servir les images
// app.get('/image-proxy/:collectionId/:id/:filename', async (req, res) => {
//     const { collectionId, id, filename } = req.params;
//     const baseUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
//     const imageUrl = `${baseUrl}/api/files/${collectionId}/${id}/${filename}`;

//     try {
//         const imageResponse = await fetch(imageUrl);
//         if (!imageResponse.ok) throw new Error('Failed to fetch image');

//         res.set('Content-Type', imageResponse.headers.get('Content-Type'));
//         imageResponse.body.pipe(res);
//     } catch (error) {
//         console.error('Error proxying image:', error);
//         res.status(500).send('Error loading image');
//     }
// });



// app.get('/api/products', async (req, res) => {
//     console.log('Requête reçue avec les paramètres:', req.query);
//     const category = req.query.category || '';
//     const search = req.query.search || '';
//     const kids = req.query.kids === 'true';
//     const adult = req.query.adult === 'true';

//     let filter = '';

//     // Ajouter le filtre par catégorie
//     if (category) filter += `category='${category}'`;

//     // Ajouter le filtre de recherche par nom
//     if (search) filter += `${filter ? ' && ' : ''}name~'${search}'`;

//     // Ajouter le filtre par public (enfants/adultes)
//     if (kids) filter += `${filter ? ' && ' : ''}kids=true`;
//     if (adult) filter += `${filter ? ' && ' : ''}adult=true`;

//     try {
//         const products = await pb.collection('articles').getList(1, 50, {
//             filter: filter,
//         });

//         // Trier les produits par ordre de catégorie défini
//         products.items.sort((a, b) => {
//             const orderA = getCategoryOrder(a.category);
//             const orderB = getCategoryOrder(b.category);
//             return orderA - orderB;
//         });

//         // Générer le HTML des produits
//         const html = products.items.map(product => {
//             // Utiliser le nouvel endpoint pour les images
//             const imageUrl = `/image-proxy/${product.collectionId}/${product.id}/${product.image}`;

//             return `
//                 <div class="col-md-3 mb-4" style="align-items: center;">
//                     <div class="card">
//                         <img src="${imageUrl}" class="card-img-top" alt="${product.name}">
//                         <div class="card-body">
//                             <h5 class="card-title">${product.name}</h5>
//                             <h6 class="card-text"><strong>${product.price}.- </strong></h6>
//                         </div>
//                     </div>
//                 </div>
//             `;
//         }).join('');

//         res.send(html);
//     } catch (error) {
//         console.error("Erreur lors de la récupération des produits :", error);
//         res.status(500).send("Erreur serveur lors de la récupération des produits");
//     }
// });

// app.listen(3000, () => {
//     console.log('Serveur démarré sur http://localhost:3000');
// });


import express from 'express';
import PocketBase from 'pocketbase';
import fetch from 'node-fetch';

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');
const app = express();

app.use(express.static('public'));

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
    const baseUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
    const imageUrl = `${baseUrl}/api/files/${collectionId}/${id}/${filename}`;

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

app.get('/api/products', async (req, res) => {
    console.log('Requête reçue avec les paramètres:', req.query);

    const category = req.query.category || '';
    const search = req.query.search || '';
    const kids = req.query.kids === 'true';  // Si kids est "true" dans l'URL
    const adult = req.query.adult === 'true'; // Si adult est "true" dans l'URL

    let filter = '';

    // Ajouter le filtre par catégorie si fourni
    if (category) filter += `category='${category}'`;

    // Ajouter le filtre de recherche par nom si fourni
    if (search) filter += `${filter ? ' && ' : ''}name~'${search}'`;

    // Ajouter le filtre par public
    if (kids) filter += `${filter ? ' && ' : ''}kids=true`;
    if (adult) filter += `${filter ? ' && ' : ''}adult=true`;

    try {
        const products = await pb.collection('articles').getList(1, 50, {
            filter: filter,
        });

        // Trier les produits par ordre de catégorie défini
        products.items.sort((a, b) => {
            const orderA = getCategoryOrder(a.category);
            const orderB = getCategoryOrder(b.category);
            return orderA - orderB;
        });

        // Générer le HTML des produits
        const html = products.items.map(product => {
            // Utiliser le nouvel endpoint pour les images
            const imageUrl = `/image-proxy/${product.collectionId}/${product.id}/${product.image}`;
            
            return `
            <div class="col-md-3 mb-4" style="display: flex; justify-content: center; align-items: center;">
                <div class="card" style="width: 100%; height: 300px;">
                    <img src="${imageUrl}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                        <h5 class="card-title">${product.name}</h5>
                        <h6 class="card-text truncated-text"><strong>${product.price}.-</strong></h6>
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


app.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
