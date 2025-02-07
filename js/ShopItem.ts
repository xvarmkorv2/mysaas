import Game from "./Game";
import ShopManager from "./managers/ShopManager";
import { ISavedShopItem } from "./interfaces/ISavedGame";

export enum SHOP_CATEGORY {
  GENERAL,
  MARKETING,
  COMPONENTS,
  COMPONENTS2
}

export enum ITEM_EFFECT {
  INCREASE_TRAFFIC,
  INCREASE_CPU,
  INCREASE_MEMORY,
  INCREASE_STORAGE
}

export default class ShopItem {
  private manager: ShopManager;
  private category: SHOP_CATEGORY;
  private name: String;
  private cost: number;
  private description: String;
  private icon: String;
  private requirements: Array<ShopItem> = [];
  private effects: String;

  // Saved
  private purchased: Boolean = false;

  constructor(manager: ShopManager, category: SHOP_CATEGORY, name: String, cost: number, description: String, icon: String, effectString: String, requirements: Array<String> = []) {
    this.manager = manager;
    this.name = name;
    this.cost = cost;
    this.category = category;
    this.description = description;
    this.icon = icon;
    this.effects = effectString;
    if (requirements.length > 0) {
      this.parseRequirements(requirements);
    }
  }

  public save(): ISavedShopItem {
    return {
      name: this.name,
      purchased: this.purchased
    }
  }

  private parseRequirements(requirements: Array<String>): void {
    requirements.forEach(req => {
      const item: ShopItem | null = this.manager.getItem(req);
      if (item instanceof ShopItem) {
        this.requirements.push(item);
      }
    });
  }

  public getName(): String {
    return this.name;
  }

  public getDescription(parseDescription: Boolean = false): String {
    if (parseDescription) {
      return this.description.replace(/\[/g, '<span>').replace(/\]/g, '</span>');
    }

    return this.description;
  }

  public getIcon(): String {
    return this.icon;
  }

  public getCost(): number {
    return this.cost;
  }

  public isInCategory(category: SHOP_CATEGORY): Boolean {
    return this.category === category;
  }

  public getRequirements(): Array<ShopItem> {
    return this.requirements;
  }

  public hasRequirements(): Boolean {
    for (let i = 0; i < this.requirements.length; i++) {
      if (this.requirements[i].isPurchased() === false) {
        return false;
      }
    }

    return true;
  }

  public canAfford(): Boolean {
    return this.cost <= this.manager.game.getMoney();
  }

  public isPurchased(): Boolean {
    return this.purchased;
  }

  public setAsPurchased(): void {
    this.purchased = true;
  }

  public activateEffects(): void {
    this.effects.split(';').forEach(effect => {
      const effectName = effect.split(':')[0];
      const effectValue = effect.split(':')[1];

      switch (effectName) {
        case 'traffic':
          this.manager.game.increaseTrafficPerSec(Number(effectValue.replace('+', '')));
          break;
        case 'cpu':
          this.manager.game.increaseServerCPU(Number(effectValue.replace('+', '')))
          break;
        case 'ram':
          this.manager.game.increaseServerMemory(Number(effectValue.replace('+', '')))
          break;
        case 'storage':
          this.manager.game.increaseServerStorage(Number(effectValue.replace('+', '')))
          break;
      }
    });
  }
}