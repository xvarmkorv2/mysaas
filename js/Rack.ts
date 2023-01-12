import BaseObject from './BaseObject';
import Server from './Server';
import Game from './Game';
import { ISavedRack } from './interfaces/ISavedGame';

class Rack extends BaseObject {
  private servers: Array<Server> = [];

  // Saved
  private name: String = 'rack00';

  constructor(game: Game) {
    super(game);
    this.name = this.game.infraManager.getNextRackName();
  }

  public save(): ISavedRack {
    return {
      name: this.name,
      servers: this.servers.map(server => server.save())
    }
  }

  public load(savedRack: ISavedRack): void {
    this.name = savedRack.name;
    savedRack.servers.forEach(savedServer => {
      const server = this.addServer();
      server.load(savedServer);
    });
  }

  public addServer(): Server {
    const server = new Server(this.game);
    this.servers.push(server);
    this.game.infraManager.updateServerCount();
    this.game.infraManager.renderInfrastructureView();
    return server;
  }

  public getServers(): Array<Server> {
    return this.servers;
  }

  public getName(): String {
    return this.name;
  }
}

export default Rack;