import EventManager from './managers/EventManager';
import InfraManager from './managers/InfraManager';
import TrafficManager from './managers/TrafficManager';
import ISavedGame from './interfaces/ISavedGame';
import ShopManager from './managers/ShopManager';
import VM from './VM';


class Game {
  // Managers
  public eventManager: EventManager;
  public infraManager: InfraManager;
  public trafficManager: TrafficManager;
  public shopManager: ShopManager;

  // Saved
  private visitCount: number = 0;
  private money: number = 0;
  private moneyPerHit: number = 1;
  private trafficPerSec: number = 0;
  private MaxCPU: number = 8;
  private MaxMemory: number = 32;
  private MaxStorage: number = 100;

  // Private
  private saveTimer: any = null;
  private trafficTimer: any = null;
  private partialTrafficCounter: number = 0;

  constructor() {
    this.eventManager = new EventManager(this);
    this.infraManager = new InfraManager(this);
    this.trafficManager = new TrafficManager(this);
    this.shopManager = new ShopManager(this);

    this.loadSavedGame();
    this.saveTimer = setInterval(this.saveGame.bind(this), 1000);
    this.trafficTimer = setInterval(this.generateTraffic.bind(this), 100);
  }

  public saveGame(): void {
    const savedGame: ISavedGame = {
      lastSaveTime: Date.now(),
      infrastructure: this.infraManager.save(),
      visitCount: this.visitCount,
      maxCPU: this.MaxCPU,
      maxMemory: this.MaxMemory,
      maxStorage: this.MaxStorage,
      money: this.money,
      moneyPerHit: this.moneyPerHit,
      shop: this.shopManager.save(),
      trafficPerSec: this.trafficPerSec
    };

    localStorage.setItem('savedGame', JSON.stringify(savedGame));
  }

  public loadSavedGame(): void {
    if (localStorage.getItem('savedGame') !== null) {
      const savedGame: ISavedGame = JSON.parse(localStorage.getItem('savedGame') as string);
      this.increaseHitCounter(savedGame.visitCount);
      this.giveMoney(savedGame.money);
      this.MaxCPU = savedGame.maxCPU || this.MaxCPU
      this.MaxMemory = savedGame.maxMemory || this.MaxMemory
      this.MaxStorage = savedGame.maxStorage || this.MaxStorage
      this.moneyPerHit = savedGame.moneyPerHit;
      this.trafficPerSec = savedGame.trafficPerSec;
      this.infraManager.load(savedGame.infrastructure);
      this.shopManager.load(savedGame.shop);
      return;
    }

    // Create a new game
    this.giveMoney(1000);
    const dc = this.infraManager.addDataCenter();
    const rack = dc.addRack();
    const server = rack.addServer();
    const vm = server.createVM(1, 1, 10, 0, true) as VM;
    vm.setPoweredOn(true);
  }

  public increaseHitCounter(amount: number = 1): void {
    this.visitCount += amount;
    document.querySelector('#hit-count').innerHTML = this.visitCount.toString();
  }

  public giveMoney(money: number): void {
    this.money += money;
    this.updateMoney();
  }

  public takeMoney(money: number): void {
    this.money -= money;
    this.updateMoney();
  }

  public updateMoney(): void {
    document.querySelector('#money-count').innerHTML = `$${this.money.toString()}`;
  }

  public giveMoneyForHit(): void {
    this.giveMoney(this.moneyPerHit);
  }

  public getMoney(): number {
    return this.money;
  }

  public getMaxCPU(): number {
    return this.MaxCPU;
  }

  public getMaxMemory(): number {
    return this.MaxMemory;
  }

  public getMaxStorage(): number {
    return this.MaxStorage;
  }

  public increaseTrafficPerSec(amount: number): void {
    this.trafficPerSec += amount;
  }

  public increaseServerCPU(amount: number): void {
    this.MaxCPU += amount;
  }

  public increaseServerMemory(amount: number): void {
    this.MaxMemory += amount;
  }

  public increaseServerStorage(amount: number): void {
    this.MaxStorage += amount;
  }

  public generateTraffic(): void {
    if (this.trafficPerSec === 0) {
      return;
    }

    const trafficPerTick = this.trafficPerSec / 10;

    this.partialTrafficCounter += trafficPerTick;

    if (this.partialTrafficCounter >= 1) {
      const hits = Math.floor(this.partialTrafficCounter);
      console.log(hits);
      for (let i = 0; i < hits; i++) {
        this.trafficManager.generateHit();
      }
      this.partialTrafficCounter -= hits;
    }
  }
}

export default Game;

window['Game'] = new Game();