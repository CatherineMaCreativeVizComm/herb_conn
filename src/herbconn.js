import herbconnHTML from "./herbconn.html?raw";
import herbconnCSS from "./herbconn.css?raw";
import { fetchAndProcessData } from "./data_fetch.js";

class HerbConnCalendar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>${herbconnCSS}</style>
      ${herbconnHTML}
    `;

    const originalUrl = "https://multimedia.scmp.com/infographics/news/hong-kong/article/3369407/canton_herbal_tea/data/raw_dt_full.csv"; 
    const isDev = import.meta.env.DEV;
    const csvUrl = isDev
      ? originalUrl.replace("https://multimedia.scmp.com", "/api/multimedia")
      : originalUrl;
    
    const nestedJSON = await fetchAndProcessData(csvUrl);

    if (nestedJSON) {
      console.log("Data loaded from service. Ready to visualize:", nestedJSON);
    }
  }
}

customElements.define("herbconn-calendar", HerbConnCalendar);