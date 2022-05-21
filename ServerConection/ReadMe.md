
# SyncAlong Conection Server Baced on Socket.oi
Socket.IO is a library that enables low-latency, bidirectional and event-based communication between a client and a server.

## [Common/known issues:](https://socket.io/docs/v4/troubleshooting-connection-issues/) 
- the socket is not able to connect
- the socket gets disconnected
- the socket is stuck in HTTP long-polling

# Sync Algoritem
Sync Algoritem works by first normalizing the curves using [Procrustes analysis](https://en.wikipedia.org/wiki/Generalized_Procrustes_analysis) 
s and then calculating [Fréchet distance](https://en.wikipedia.org/wiki/Fr%C3%A9chet_distance) between the curves.
