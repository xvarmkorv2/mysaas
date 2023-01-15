import BaseManager from "./BaseManager";
import Game from "../Game";
import ShopItem, { SHOP_CATEGORY } from "../ShopItem";
import { ISavedShop } from "../interfaces/ISavedGame";

class ShopManager extends BaseManager {
  private items: Array<ShopItem> = [];

  constructor(game: Game) {
    super(game);
    this.populateItems();
  }

  public save(): ISavedShop {
    return {
      items: this.items.map(item => item.save())
    }
  }

  public load(savedShop: ISavedShop): void {
    savedShop.items.forEach(item => {
      const itemObj = this.getItem(item.name);
      if (itemObj && item.purchased === true) {
        itemObj.setAsPurchased();
      }
    });
  }

  private populateItems(): void {
    const eth = "fa-solid fa-ethernet"
    // General
    this.items.push(new ShopItem(this, SHOP_CATEGORY.GENERAL, 'CDN', 500, 'Research how to create a [CDN] vm type. This will handle all [/static] routes.', 'fab fa-maxcdn', '', []));
    // Marketing
    this.items.push(new ShopItem(this, SHOP_CATEGORY.MARKETING, 'Tell My Friends I', 100, 'You tell your friends about your new website and gain [+1/s] in traffic.', 'fas fa-users', 'traffic:+1', []));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.MARKETING, 'Tell My Friends II', 1000, 'You post about your website on social media and gain [+5/s] in traffic.', 'fas fa-users', 'traffic:+5', ['Tell My Friends I']));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.MARKETING, 'Podcast I', 2000, 'You advertise on a podcast and gain [+15/s] in traffic.', 'fas fa-podcast', 'traffic:+15', []));
    // Components
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS, 'New CPUs', 4000, 'This upgrade allows you to have 4 more cores.', 'fas fa-microchip', 'cpu:+4', []));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS, 'New CPUs II', 20000, 'This upgrade allows you to have 20 more cores.', 'fas fa-microchip', 'cpu:+20', ['New CPUs']));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS, 'New CPUs III', 32000, 'This upgrade allows you to have 32 more cores.', 'fas fa-microchip', 'cpu:+32', ['New CPUs II']));
    //internet
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS, 'Better ISP', 5000, 'This upgrade increases upload and Download speed faster, making recieving traffic faster.', eth, 'traffic:+2', []));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS, 'Ethernet', 7000, 'This upgrade increases upload and Download speed faster, making recieving traffic faster.', eth, 'traffic:+6', ['Better ISP']));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS, 'Fiberoptic', 9000, 'This upgrade increases upload and Download speed faster, making recieving traffic faster.', eth, 'traffic:+12', ['Ethernet']));
    //components II
    //memory
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS2, 'More Sticks of RAM', 12000, 'This upgrade allows you to have a max of 64gbs of ram.', 'fas fa-microchip', 'ram:+32', ['New CPUs II']));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS2, 'More Sticks of RAM II', 24000, 'This upgrade allows you to have a max of 128gbs of ram', 'fas fa-microchip', 'ram:+64', ['More Sticks of RAM']));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS2, 'More Sticks of RAM III', 48000, 'This upgrade allows you to have a max of 256gbs of ram', 'fas fa-microchip', 'ram:+128', ['More Sticks of RAM II']));
    //storage
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS2, 'More Hardrives', 24000, 'This upgrade allows you to have a max of 200gbs of storage.', 'fas fa-microchip', 'storage:+100', ['More Sticks of RAM']));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS2, 'More Hardrives II', 12000, 'This upgrade allows you to have a max of 400gbs of storage.', 'fas fa-microchip', 'storage:+200', ['More Hardrives']));
    this.items.push(new ShopItem(this, SHOP_CATEGORY.COMPONENTS2, 'More Hardrives III', 16000, 'This upgrade allows you to have a max of 1000gbs of storage.', 'fas fa-microchip', 'storage:+600', ['More Hardrives II']));
  }

  public getItem(itemName: String): ShopItem | null {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].getName() === itemName) {
        return this.items[i];
      }
    }

    return null;
  }

  public renderShopView(): void {
    const cats = [
      { name: 'general', category: SHOP_CATEGORY.GENERAL },
      { name: 'marketing', category: SHOP_CATEGORY.MARKETING },
      { name: 'components', category: SHOP_CATEGORY.COMPONENTS },
      { name: 'components2', category: SHOP_CATEGORY.COMPONENTS2 }
    ];

    cats.forEach(cat => {
      const divContainer = document.querySelector(`.game .shop .shop-container.${cat.name}`) as Element;
      const filteredItems = this.items.filter(item => item.isInCategory(cat.category) && item.hasRequirements());

      let divHtml = '';
      filteredItems.forEach(item => {
        divHtml += `<div class="item ${item.isPurchased() ? 'purchased' : ''}" onclick="Game.eventManager.emit('shop_purchase', '${item.getName()}')">`;
        divHtml += `<div class="icon"><i class="${item.getIcon()}"></i></div>`;
        divHtml += `<div class="about">`;
        divHtml += `<div class="name">${item.getName()}</div>`;
        divHtml += `<div class="desc">${item.getDescription(true)}</div>`;
        if (item.getRequirements().length > 0) {
          divHtml += `<div class="req">Requires [`;
          item.getRequirements().forEach(req => {
            divHtml += `<span>${req.getName()}</span>`;
          });
          divHtml += `]</div>`;
        }
        divHtml += `</div>`;
        divHtml += `<div class="actions ${item.isPurchased() ? 'purchased' : ''}">`;
        if (!item.isPurchased()) {
          divHtml += '<div class="purchase">';
          divHtml += '<div>BUY</div>';
          divHtml += `<div class="purchase-amount ${item.canAfford() ? '' : 'red'}">[ $${item.getCost()} ]</div>`;
          divHtml += '</div>';
        } else {
          divHtml += '<div class="purchased"><i class="fas fa-check"></i></div>';
        }
        divHtml += `</div>`;
        divHtml += '</div>';
      });

      divContainer.innerHTML = divHtml;
    });
  }
}

export default ShopManager;