function injectFooter() {
  const footerHTML = `
    <footer>
      <div class="footer-content">
        <p>&copy; 2025 Classy Dishes - Tous droits réservés.</p>
        <p>Contact : contact@classydishes.fr</p>
        <p><a href="#">Politique de confidentialité</a> | <a href="#">Conditions générales de vente</a></p>
        <div class="social-links">
          <a href="#">Facebook</a>
          <a href="#">Instagram</a>
          <a href="#">Pinterest</a>
        </div>
      </div>
    </footer>
  `;
  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

document.addEventListener('DOMContentLoaded', injectFooter);