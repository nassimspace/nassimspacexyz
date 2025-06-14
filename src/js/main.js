
// pwa-handler

window.addEventListener('load', () => {
  updateOnlineStatus();
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

function updateOnlineStatus() {
  const offlineBanner = document.getElementById('offline-banner');
  if (!navigator.onLine) {
      offlineBanner?.classList.remove('hidden');
      console.warn("You are offline");
  } else {
      offlineBanner?.classList.add('hidden');
      console.info("You are online");
  }
}

const buttons = document.querySelectorAll(".card-buttons button");
const sections = document.querySelectorAll(".card-section");
const card = document.querySelector(".card");

const handleButtonClick = e => {
  const targetSection = e.target.getAttribute("data-section");
  const section = document.querySelector(targetSection);
  targetSection !== "#about" ?
  card.classList.add("is-active") :
  card.classList.remove("is-active");
  card.setAttribute("data-state", targetSection);
  sections.forEach(s => s.classList.remove("is-active"));
  buttons.forEach(b => b.classList.remove("is-active"));
  e.target.classList.add("is-active");
  section.classList.add("is-active");
};

buttons.forEach(btn => {
  btn.addEventListener("click", handleButtonClick);
});

(function () {
  // DON'T EDIT BELOW THIS LINE
  var d = document,
  s = d.createElement("script");
  s.src = "https://card-nasspace.disqus.com/embed.js";
  s.setAttribute("data-timestamp", +new Date());
  (d.head || d.body).appendChild(s);
})();

class GDriveFolderEmbed extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["folderid", "render", "title"];
  }

  async connectedCallback() {
    const folderId = this.getAttribute("folderid");
    const render = this.getAttribute("render");
    const title = this.getAttribute("title");
    
    if (!folderId || !render) {
      console.error("Missing folder ID or render option");
      return;
    }

    try {
      const url = `https://drive.google.com/embeddedfolderview?id=${folderId}#${render}`;
      
      const iframe = document.createElement("iframe");
      iframe.setAttribute("src", url);
      iframe.setAttribute("title", title);
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("style", "justify-content: space-evenly; width:75dvw; height: 75dvh;display: inline-block; background: #180436; position: relative; object-fit: contain; border: none;");
      iframe.setAttribute("aria-label", title) ;        
      iframe.setAttribute("role", "Presentation") ;
      iframe.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("scrolling", "auto");
      iframe.setAttribute("seamless", "");
      iframe.setAttribute("role", "presentation");
      iframe.setAttribute("aria-label", title);
      iframe.setAttribute("credentialless", "true");

      requestAnimationFrame(() => {
      this.shadowRoot.appendChild(iframe);
    });
    } catch (error) {
      console.error("Error loading Google Drive folder:", error);
    }
  }
}

customElements.define("gdf-embed", GDriveFolderEmbed);
