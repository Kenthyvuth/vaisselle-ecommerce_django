function injectNavbar() {
  const navbarHTML = `
    <nav class="navbar">
      <div class="logo">Classy Dishes</div>
      <ul class="nav-links" id="nav-links">
        <li><a href="index.html">Accueil</a></li>
        <li><a href="produits.html">Produits</a></li>
        <li><a href="promotions.html">Promotions</a></li>
        <li><a href="panier.html">Panier</a></li>
        <li><a href="contact.html">Contact</a></li>
        <!-- "Mon Compte" or "Déconnexion" will be injected here -->
      </ul>
    </nav>
  `;
  document.body.insertAdjacentHTML('afterbegin', navbarHTML);

  // Dynamically show "Mon Compte" or "Déconnexion"
  const navLinks = document.getElementById('nav-links');
  const isLoggedIn = !!localStorage.getItem('access');

  // Remove existing last nav item if present (for reloads)
  if (navLinks.lastElementChild) navLinks.removeChild(navLinks.lastElementChild);

  if (isLoggedIn) {
    const logoutLi = document.createElement('li');
    const logoutA = document.createElement('a');
    logoutA.href = "#";
    logoutA.id = "logout-link";
    logoutA.textContent = "Déconnexion";
    logoutLi.appendChild(logoutA);
    navLinks.appendChild(logoutLi);

    logoutA.onclick = function(e) {
      if (!confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      alert('Vous êtes déconnecté.');
      window.location.href = "index.html";
    };
  } else {
    const compteLi = document.createElement('li');
    const compteA = document.createElement('a');
    compteA.href = "compte.html";
    compteA.textContent = "Mon Compte";
    compteLi.appendChild(compteA);
    navLinks.appendChild(compteLi);
  }
}

// Inject navbar on DOMContentLoaded
document.addEventListener('DOMContentLoaded', injectNavbar);