let panier = [];

// Charger le panier depuis localStorage
function chargerPanier() {
  panier = JSON.parse(localStorage.getItem("panier")) || [];
}

// Sauvegarder le panier dans localStorage
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

// Supprimer une seule occurrence d'un produit
function supprimerUneUnite(idProduit) {
  chargerPanier();
  const index = panier.findIndex(item => item.id === idProduit);
  if (index !== -1) {
    panier.splice(index, 1);
    sauvegarderPanier();
    afficherPanier();
  }
}

// Ajouter une unité de plus depuis le panier
function ajouterUneUnite(idProduit) {
  chargerPanier();
  const item = panier.find(p => p.id === idProduit);
  if (item) {
    panier.push({ ...item });
    sauvegarderPanier();
    afficherPanier();
  }
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

  const panierRegroupe = {};
  panier.forEach(article => {
    if (panierRegroupe[article.id]) {
      panierRegroupe[article.id].quantite++;
    } else {
      panierRegroupe[article.id] = { ...article, quantite: 1 };
    }
  });

  Object.values(panierRegroupe).forEach(article => {
    const sousTotal = article.prix * article.quantite;
    total += sousTotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <h4>${article.nom}</h4>
      <p>
        ${sousTotal.toFixed(2)} € 
        <button onclick="supprimerUneUnite(${article.id})">-</button>
        <span>x${article.quantite}</span>
        <button onclick="ajouterUneUnite(${article.id})">+</button>
      </p>
    `;
    container.appendChild(div);
  });

  const resume = document.createElement("div");
  resume.className = "cart-summary";
  resume.innerHTML = `
    <p>Total : <strong>${total.toFixed(2)} €</strong></p>
    <button class="checkout-btn" onclick="redirigerCommande()">Valider la commande</button>
  `;
  container.appendChild(resume);

  // Ajout du bouton newsletter si panier non vide
  const btnNewsletter = document.createElement("button");
  btnNewsletter.id = "btn-newsletter";
  btnNewsletter.className = "reminder-btn";
  btnNewsletter.textContent = "Me rappeler de valider mon panier";
  // btnNewsletter.style.margin = "1rem auto";
  // btnNewsletter.style.display = "block";
  btnNewsletter.onclick = async function() {
    const token = localStorage.getItem('access');
    if (!token) {
      alert("Vous devez être connecté.");
      window.location.href = "compte.html";
      return;
    }
    const resp = await fetch('http://localhost:8000/api/newsletter/reminder/', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (resp.ok) {
      alert("Un email de rappel a été envoyé sur votre boîte de messagerie.");
    } else {
      alert("Erreur lors de l'envoi du mail.");
    }
  };
  container.appendChild(btnNewsletter);
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

  // Obtenir l'ID utilisateur
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

  // Regrouper les articles pour l’envoi
  const articlesRegroupes = {};
  panier.forEach(item => {
    if (articlesRegroupes[item.id]) {
      articlesRegroupes[item.id].qty++;
    } else {
      articlesRegroupes[item.id] = {
        product: item.id,
        qty: 1,
        price: parseFloat(item.prix)
      };
    }
  });

  const items = Object.values(articlesRegroupes);
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  // Envoyer la commande
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

// Charger les produits
async function chargerProduits() {
  const response = await fetch('http://localhost:8000/api/produits/');
  const produits = await response.json();
  const container = document.getElementById('produits-container');
  container.innerHTML = '';
  produits.filter(p => p.promo_price == null || p.promo_price == undefined)
    .forEach(produit => {
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

// Charger les promotions
async function chargerPromotions() {
  const response = await fetch('http://localhost:8000/api/produits/');
  const produits = await response.json();
  const container = document.getElementById('promos-container');
  container.innerHTML = '';
  produits.filter(p => p.promo_price !== null && p.promo_price !== undefined)
    .forEach(produit => {
      const div = document.createElement('div');
      div.className = 'promo-card';
      div.innerHTML = `
        <img src="${produit.image}" alt="${produit.name}">
        <h3>${produit.name}</h3>
        <span class="old-price">${parseFloat(produit.price).toFixed(2)} €</span>
        <span class="new-price">${parseFloat(produit.promo_price).toFixed(2)} €</span>
        <button onclick="ajouterAuPanier('${produit.name.replace(/'/g, "\\'")}', ${produit.promo_price}, ${produit.id})">Ajouter au panier</button>
      `;
      container.appendChild(div);
    });
}

// Rediriger vers la page commande
function redirigerCommande() {
  const token = localStorage.getItem('access');
  if (!token) {
    alert('Vous devez être connecté pour commander.');
    window.location.href = "compte.html";
    return;
  }
  window.location.href = "commande_details.html";
}

document.getElementById('btn-newsletter').onclick = async function() {
  const token = localStorage.getItem('access');
  if (!token) {
    alert("Vous devez être connecté.");
    window.location.href = "compte.html";
    return;
  }
  const resp = await fetch('http://localhost:8000/api/newsletter/reminder/', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (resp.ok) {
    alert("Un email de rappel vous a été envoyé !");
  } else {
    alert("Erreur lors de l'envoi du mail.");
  }
};
