const socketio = require('socket.io');

export default class Room {
  constructor(options) {
    /** @type {Server} */
    this.io = options.io;

    /** @type {Socket} */
    this.socker = options.socket;

    this.username = options.username;
    this.roomId = options.roomId;
    this.password = options.password;
    this.action = options.action; // [join, create]
  }

  /**
   *  Initialises steps on first connection.
   *  Checks if room available:
   *      If yes, then joins the room
   *      If no, then creates new room.
   * @access  public
   * @return  {bool} Returns true if initialization is successfull, false otherwise
   */
  async init(username) {
    // Stores an array containing socket ids in 'roomId'
    const clients = await this.io.in(this.roomId).allSockets();
    if (!clients) {
      console.error('[Error]: Room creation failed!');
    }
    console.info(`Connected Clients are: ${clients}`);

    if (this.action === 'join') {
      if (clients.size > 0 && clients.size < 3) {
        await this.socker.join(this.roomId);
        this.socker.username = username;
        this.socker.emit('[SUCCESS] Successfully initialised', {
          roomId: this.roomId,
          password: this.password
        });
        console.info(`[JOIN] Client joined room ${this.roomId}`);
        return true;
      }
      console.warn(
        `[JOIN FAILED] Client denied join, as roomId ${this.roomId} not created`
      );
      this.socker.emit('Error: Create a room first!');
      return false;
    }

    if (this.action === 'create') {
      if (clients.size === 0) {
        await this.socker.join(this.roomId);
      }
      this.socker.username = username;
      console.info(`[CREATE] Client created and joined room ${this.roomId}`);
      this.socker.emit('[SUCCESS] Successfully initialised', {
        roomId: this.roomId,
        password: this.password
      });
      return true;
    }
    console.warn(
      `[CREATE FAILED] Client denied create, as roomId ${this.roomId} already present`
    );
    this.socker.emit('Error: Room already created. Join the room!');
    return false;
  }

  /**
   * Gracefully disconnect the user from the game and end the draft
   * Preserving the gameState
   *
   * @access    public
   */
   onDisconnect() {
    this.socker.on('disconnect', () => {
      try {
        //Disconnect
      } catch {
        console.info('[FORCE DISCONNECT] Server closed forcefully');
      }

      console.info('Client Disconnected!');
    });
  }
}
