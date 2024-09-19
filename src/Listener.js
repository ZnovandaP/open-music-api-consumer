class Listener {
  constructor(playlistService, mailSender) {
    this._playlistService = playlistService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { ownerId, playlistId, targetEmail } = JSON.parse(message.content.toString());
      console.log(`message from ${ownerId} to ${targetEmail}`);

      await this._playlistService.verifyPlaylistAccessIsOwner(playlistId, ownerId);

      const playlist = await this._playlistService.getSongInPlaylist(playlistId);

      const content = { playlist };

      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify(content));
      console.log(result);
      console.log('Email terkirim!');
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
