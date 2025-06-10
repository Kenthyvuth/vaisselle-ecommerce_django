// Utilise le panier côté client, mais envoie la commande au backend Django

let panier = [];

// Charger le panier depuis le backend ou localStorage (ici, local pour démo)
function chargerPanier() {
  panier = JSON.parse(localStorage.getItem("panier")) || [];
}

// Sauvegarder le panier localement
function sauvegarderPanier() {
  localStorage.setItem("panier", JSON.stringify(panier));
}

// Ajouter un produit au panier
function ajouterAuPanier(nom, prix, idProduit) {
  chargerPanier();
  panier.push({ nom, prix, id: idProduit });
  sauvegarderPanier();
  alert(`${nom} ajouté au panier !`);
}

// Supprimer un produit du panier
function supprimerDuPanier(index) {
  chargerPanier();
  panier.splice(index, 1);
  sauvegarderPanier();
  window.location.reload();
}

// Afficher le panier
function afficherPanier() {
  chargerPanier();
  const container = document.getElementById("contenu-panier");
  container.innerHTML = "";
  let total = 0;

  if (panier.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:#ccc; font-style:italic;'>Votre panier est vide.</p>";
    return;
  }

  panier.forEach((article, index) => {
    total += parseFloat(article.prix);
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <h4>${article.nom}</h4>
      <p>${parseFloat(article.prix).toFixed(2)} € <button onclick="supprimerDuPanier(${index})">Supprimer</button></p>
    `;
    container.appendChild(div);
  });

  const resume = document.createElement("div");
  resume.className = "cart-summary";
  resume.innerHTML = `
    <p>Total : <strong>${total.toFixed(2)} €</strong></p>
    <button class="checkout-btn" onclick="validerCommande()">Valider la commande</button>
  `;
  container.appendChild(resume);
}

// Envoyer la commande au backend Django
async function validerCommande() {
  chargerPanier();
  if (panier.length === 0) {
    alert("Votre panier est vide.");
    return;
  }

  const token = localStorage.getItem('access');
  if (!token) {
    alert('Vous devez être connecté pour commander.');
    window.location.href = "compte.html";
    return;
  }

  // 1. Get user ID from backend
  let userId = null;
  try {
    const userResp = await fetch('http://localhost:8000/api/auth/me/', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (userResp.ok) {
      const userData = await userResp.json();
      userId = userData.id;
    } else {
      alert('Impossible de récupérer votre profil utilisateur.');
      return;
    }
  } catch (e) {
    alert('Erreur réseau lors de la récupération du profil.');
    return;
  }

  // 2. Prepare items and total
  const items = panier.map(item => ({
    product: item.id, // <-- must be 'product'
    qty: item.quantite ? item.quantite : 1,
    price: parseFloat(item.prix)
  }));
  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // 3. Send order
  try {
    const response = await fetch('http://localhost:8000/api/commandes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        user: userId,
        total: total,
        items: items
      })
    });

    if (response.ok) {
      alert('Commande validée !');
      panier = [];
      sauvegarderPanier();
      window.location.reload();
    } else if (response.status === 401) {
      alert('Session expirée. Veuillez vous reconnecter.');
      window.location.href = "compte.html";
    } else {
      const err = await response.json();
      alert('Erreur lors de la commande: ' + JSON.stringify(err));
    }
  } catch (error) {
    alert('Erreur réseau.');
  }
}

// Charger et afficher les produits depuis le backend
async function chargerProduits() {
  const response = await fetch('http://localhost:8000/api/produits/');
  const produits = await response.json();
  const container = document.getElementById('produits-container');
  container.innerHTML = '';
  produits.forEach(produit => {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img src="${produit.image}" alt="${produit.name}">
      <h3>${produit.name}</h3>
      <p>${produit.description}</p>
      <span>${parseFloat(produit.price).toFixed(2)} €</span>
      <button onclick="ajouterAuPanier('${produit.name.replace(/'/g, "\\'")}', ${produit.price}, ${produit.id})">Ajouter au panier</button>
    `;
    container.appendChild(div);
  });
}

// À appeler au chargement de la page panier
// afficherPanier();
