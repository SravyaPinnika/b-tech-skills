import type { TopicMap } from "../topicContent";

export const networksTopics: TopicMap = {
  "OSI & TCP/IP layers": {
    summary:
      "Layered models split networking into independent responsibilities. OSI has 7 layers; the practical TCP/IP stack has 4.",
    keyPoints: [
      "OSI: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
      "TCP/IP: Link, Internet (IP), Transport (TCP/UDP), Application (HTTP, DNS).",
      "Each layer adds a header — encapsulation on the way down, decapsulation on the way up.",
      "Know which device works at which layer: hub L1, switch L2, router L3.",
    ],
    syntax: {
      lang: "text",
      code: "[ Ethernet | IP | TCP | HTTP payload ]\n  L2        L3   L4    L7",
    },
    diagram: `sender                        receiver
 App    HTTP data       ---->   App
 Trans  +TCP header     ---->   Trans
 Net    +IP header      ---->   Net
 Link   +MAC frame      ---->   Link
        ==== wire ====`,
    deepDive: [
      "The OSI model is a teaching and reference model, not something every real network literally implements layer by layer. Its value is separation of concerns: a switch does not need to understand HTTP, and a browser does not need to know about Ethernet frames. Each layer only talks to the layer directly above and below it through a well-defined interface, so you can swap Wi-Fi for Ethernet at layer 2 without changing anything above layer 3.",
      "The TCP/IP model is what actually ships in production, and it collapses OSI's top three layers (session, presentation, application) into one Application layer, because in practice things like TLS and session handling are done inside application libraries rather than as separate OS layers. When you troubleshoot a network issue, thinking in TCP/IP terms is usually more productive: is it a link problem (cable, Wi-Fi), an IP/routing problem, a transport problem (port blocked, connection refused), or an application problem (wrong URL, bad payload).",
      "Encapsulation is the mechanical core of both models: each layer wraps the layer above's data with its own header (and sometimes trailer), and the receiving side strips headers in reverse order. This is why a packet capture (Wireshark) shows nested frames — an Ethernet frame containing an IP packet containing a TCP segment containing an HTTP request. Interviewers often ask you to map a real device or a bug to the correct layer to test whether you understand this separation.",
    ],
    example: {
      title: "Tracing a web request through the layers",
      steps: [
        "Application layer: browser builds an HTTP GET request for example.com.",
        "Transport layer: TCP wraps it in a segment with source/destination ports (e.g. 51000 -> 443) and a sequence number.",
        "Network layer: IP wraps the segment with source and destination IP addresses.",
        "Link layer: Ethernet/Wi-Fi wraps the packet with source/destination MAC addresses for the next hop.",
        "The frame goes on the wire; each router down the path strips and rebuilds only the link layer header while keeping the IP packet intact.",
      ],
      result: "The HTTP request arrives at the server with all four headers intact, and the server unwraps them in reverse order to read the original request.",
    },
    mistakes: [
      { mistake: "Treating OSI's 7 layers as something every protocol must implement explicitly.", fix: "Remember OSI is a reference model; real stacks like TCP/IP merge layers 5-7 into one Application layer." },
      { mistake: "Confusing which device operates at which layer (e.g. saying a switch reads IP addresses).", fix: "Switches work at layer 2 (MAC addresses); routers work at layer 3 (IP addresses); hubs are layer 1 with no addressing at all." },
      { mistake: "Thinking encapsulation only happens once at the source.", fix: "Every router along the path re-examines and can rebuild the link-layer header, while the IP header stays the same end to end (except TTL and checksum)." },
    ],
    interviewQA: [
      { q: "Why do we need both OSI and TCP/IP models?", a: "OSI is a detailed conceptual/teaching model for understanding responsibilities; TCP/IP is the simpler model that real-world protocols actually follow, merging the top three OSI layers into one Application layer." },
      { q: "At which layer does a router operate, and why?", a: "Layer 3 (Network), because it makes forwarding decisions based on IP addresses and routing tables, not MAC addresses." },
      { q: "What is encapsulation and why does it matter for interoperability?", a: "Each layer wraps the data from the layer above with its own header. It matters because it lets layers evolve independently — for example, you can change the physical medium without touching the transport or application protocols." },
      { q: "Where would you place TLS in the OSI model?", a: "It sits between the transport and application layers, roughly matching OSI's presentation layer, since it encrypts the payload the application would otherwise send directly over TCP." },
    ],
    practice: [
      "Open Wireshark, capture a request to a website, and identify the Ethernet, IP, TCP, and HTTP headers in one packet.",
      "List which layer failure would explain: 'website is down', 'cannot resolve domain', 'cable unplugged', and 'wrong page content'.",
      "Draw the encapsulation diagram from memory for an HTTPS request.",
      "Explain in one sentence what problem each OSI layer solves, without looking at notes.",
    ],
  },

  "TCP vs UDP, handshakes, flow control": {
    summary:
      "TCP is connection-oriented and reliable with ordering and retransmission. UDP is connectionless, unordered and fast.",
    keyPoints: [
      "TCP: 3-way handshake SYN, SYN-ACK, ACK; teardown FIN/ACK.",
      "Flow control uses the receiver window; congestion control uses slow start + AIMD.",
      "UDP suits DNS, video, gaming, VoIP where a late packet is worse than a lost one.",
      "Head-of-line blocking is the TCP drawback QUIC/HTTP3 addresses.",
    ],
    syntax: {
      lang: "text",
      code: "cwnd doubles each RTT (slow start)\non loss: cwnd halves (multiplicative decrease)",
    },
    diagram: `client                 server
  | ---- SYN --------->  |
  | <--- SYN + ACK ----  |
  | ---- ACK --------->  |  connection open
  | ==== data =========  |
  | ---- FIN --------->  |  teardown

UDP:  | ---- datagram --> |   (no setup, no guarantee)`,
    deepDive: [
      "TCP's reliability comes from sequence numbers and acknowledgements: every byte sent has a position in the stream, and the receiver acknowledges how much it has received in order. If an ACK does not arrive within a timeout, the sender retransmits. This guarantees that data is delivered in order and without gaps, but it costs round trips and buffering, which is why TCP is slower to start than UDP.",
      "Flow control and congestion control solve two different problems that students often mix up. Flow control protects the receiver — it caps how much unacknowledged data the sender can have in flight based on the receiver's advertised window, so a slow receiver is not overwhelmed. Congestion control protects the network — it uses the congestion window (cwnd), which starts small (slow start, roughly doubling each RTT) and backs off multiplicatively when loss is detected (AIMD: additive increase, multiplicative decrease), so many competing flows share a link fairly instead of collapsing it.",
      "UDP intentionally drops all of this: no handshake, no retransmission, no ordering guarantee, just fire-and-forget datagrams with an optional checksum. That is exactly what live audio/video and DNS want, because retransmitting an old video frame is pointless (a late frame is worse than a dropped one), and DNS queries are small enough that the application itself can just retry. Newer protocols like QUIC run over UDP but rebuild reliability and multiplexing in user space, avoiding TCP's head-of-line blocking where one lost segment stalls all the streams multiplexed on that connection.",
    ],
    example: {
      title: "Dry run of a TCP handshake and one data exchange",
      steps: [
        "Client sends SYN with an initial sequence number, e.g. seq=100.",
        "Server replies SYN-ACK with its own seq=300 and ack=101 (acknowledging client's SYN).",
        "Client replies ACK with ack=301; connection is now ESTABLISHED.",
        "Client sends 50 bytes of data (seq=101); server ACKs with ack=151.",
        "Either side sends FIN to start graceful teardown; the other ACKs and also sends its own FIN.",
      ],
      result: "A reliable, ordered byte stream is established and cleanly closed, with every byte accounted for by sequence numbers.",
    },
    mistakes: [
      { mistake: "Believing UDP is 'unreliable' in the sense of being broken or unsafe to use.", fix: "UDP is reliable at the physical/logical send level, it simply provides no delivery guarantee — reliability, if needed, must be built by the application." },
      { mistake: "Confusing flow control with congestion control in interviews.", fix: "Flow control = receiver's capacity (advertised window); congestion control = network's capacity (congestion window, slow start, AIMD)." },
      { mistake: "Assuming a 4-way close always happens in a fixed strict order.", fix: "Either side can initiate FIN; the connection is half-closed until both sides have sent FIN and received the corresponding ACK." },
    ],
    interviewQA: [
      { q: "Why does TCP use a three-way handshake instead of two messages?", a: "Both sides need to exchange and acknowledge each other's initial sequence numbers; two messages would let one side start assuming a connection is open before it confirms the other side agrees, risking stale or duplicate connection requests being accepted." },
      { q: "What is head-of-line blocking in TCP and how does QUIC avoid it?", a: "If one TCP segment is lost, all data behind it in the stream is withheld from the application until it is retransmitted, even if that data belongs to a logically independent stream (e.g. one HTTP/2 stream). QUIC runs multiple independent streams over UDP so a lost packet only blocks its own stream." },
      { q: "When would you choose UDP over TCP for a new feature?", a: "When timeliness matters more than completeness — live video/audio, multiplayer game state, or simple query/response protocols like DNS where the application can retry cheaply." },
      { q: "What triggers TCP slow start to reduce its rate?", a: "Detecting packet loss (timeout or duplicate ACKs), which is treated as a signal of congestion, causing the congestion window to be cut (typically halved) before growing again." },
    ],
    practice: [
      "Draw the TCP 3-way handshake and 4-way teardown with sequence/ack numbers filled in.",
      "Explain the difference between flow control and congestion control in two sentences.",
      "List three applications that should use UDP and justify each choice.",
      "Research how QUIC avoids TCP head-of-line blocking and summarize in three bullet points.",
      "Use `nc` or `curl` to observe a TCP connection and packet capture with Wireshark, and locate the SYN/SYN-ACK/ACK.",
    ],
  },

  "HTTP/HTTPS, TLS, status codes": {
    summary:
      "HTTP is a stateless request/response protocol. HTTPS is HTTP inside TLS, which provides encryption, integrity and server identity.",
    keyPoints: [
      "Methods: GET (safe), POST, PUT (idempotent), PATCH, DELETE.",
      "Status families: 2xx success, 3xx redirect, 4xx client error, 5xx server error.",
      "TLS handshake: hello, certificate check, key exchange, then symmetric encryption.",
      "Statelessness is why we need cookies, tokens or sessions.",
    ],
    syntax: {
      lang: "http",
      code: "GET /api/tools HTTP/1.1\nHost: example.com\nAuthorization: Bearer <token>\n\n200 OK / 401 Unauthorized / 404 Not Found / 500 Server Error",
    },
    diagram: `browser                       server
  |-- ClientHello ------------->|
  |<- ServerHello + certificate-|
  |-- verify cert, key exchange->|
  |==== encrypted HTTP =========|
symmetric key used after handshake (fast)`,
    deepDive: [
      "HTTP is stateless by design: each request carries all the context the server needs, and the server does not remember previous requests from the same client. This makes servers easy to scale horizontally (any server can handle any request), but it means state — like 'is this user logged in' — has to be carried explicitly, usually via a cookie holding a session ID or a bearer token like a JWT that the server can verify without a shared session store.",
      "TLS solves three separate problems in one handshake: confidentiality (nobody can read the traffic), integrity (nobody can tamper with it undetected), and authentication (you are actually talking to the real server, verified via its certificate chain up to a trusted root CA). The handshake is expensive because it involves asymmetric cryptography (certificate verification, key exchange), so TLS uses that only to establish a shared symmetric key, then switches to fast symmetric encryption (like AES) for the actual data — this is why HTTPS has a one-time handshake cost per connection but is not meaningfully slower afterward. TLS 1.3 reduced this further, cutting the handshake to one round trip.",
      "Status codes are a contract, and picking the right one matters for correctness of clients, caches and monitoring. 2xx means the request succeeded; 3xx tells the client to look elsewhere (redirect); 4xx blames the client (bad input, missing auth, not found); 5xx blames the server. A common real bug is returning 200 with an error message in the JSON body — this breaks caching, retries, and monitoring dashboards that key off status codes, so the status code and the body should always agree.",
    ],
    example: {
      title: "A login flow over HTTPS",
      steps: [
        "Browser opens a TCP connection to the server on port 443.",
        "TLS handshake: ClientHello, ServerHello with certificate, key exchange; both sides derive a shared symmetric key.",
        "Browser sends an encrypted POST /login with a username and password in the body.",
        "Server verifies credentials, responds 200 OK with Set-Cookie: sid=abc123; HttpOnly; Secure.",
        "Every later request from that browser automatically includes the cookie, letting the server identify the user without storing state per TCP connection.",
      ],
      result: "The user stays 'logged in' across many stateless HTTP requests because the cookie carries the identity token each time.",
    },
    mistakes: [
      { mistake: "Using GET for actions that change state (e.g. GET /deleteUser?id=5).", fix: "GET must be safe and side-effect free; use POST/DELETE for actions that change server state, partly because GETs can be prefetched or cached." },
      { mistake: "Returning HTTP 200 for application-level errors.", fix: "Match the status code to the real outcome (4xx for client mistakes, 5xx for server failures) so clients, caches, and monitoring behave correctly." },
      { mistake: "Assuming HTTPS makes an application fully secure.", fix: "TLS only protects data in transit; it does nothing against XSS, SQL injection, weak passwords, or a compromised server — application-level security is still required." },
    ],
    interviewQA: [
      { q: "What is the difference between PUT and PATCH?", a: "PUT replaces the entire resource and is idempotent (sending it twice has the same effect as once); PATCH applies a partial update and is not required to be idempotent." },
      { q: "Why is HTTP called stateless, and how do we maintain login sessions?", a: "The server does not retain memory of past requests by default; state is carried explicitly via cookies (session ID) or tokens (JWT) sent with each request." },
      { q: "Explain what happens during a TLS handshake at a high level.", a: "The client and server exchange hello messages, the server presents a certificate that the client verifies against a trusted CA, they perform a key exchange to agree on a shared secret, and then all further data is encrypted with a fast symmetric cipher using that secret." },
      { q: "What is the difference between 401 and 403?", a: "401 Unauthorized means the client is not authenticated (missing/invalid credentials); 403 Forbidden means the client is authenticated but not allowed to access that resource." },
    ],
    practice: [
      "List the correct status code for: resource created, resource not found, invalid request body, server crashed, and redirected permanently.",
      "Use curl -v against a real HTTPS site and identify the TLS handshake lines in the verbose output.",
      "Explain the difference between a cookie-based session and a JWT-based session.",
      "Write down which HTTP methods are idempotent and which are not, with a one-line reason each.",
    ],
  },

  "DNS resolution, DHCP, NAT": {
    summary:
      "DNS translates names to IP addresses. DHCP hands out local IP configuration. NAT lets many private hosts share one public IP.",
    keyPoints: [
      "Resolution order: browser cache -> OS cache -> resolver -> root -> TLD -> authoritative.",
      "Record types: A, AAAA, CNAME, MX, TXT, NS; TTL controls caching.",
      "DHCP flow: DISCOVER, OFFER, REQUEST, ACK.",
      "NAT rewrites source IP/port and keeps a translation table.",
    ],
    syntax: {
      lang: "text",
      code: "dig example.com A\nnslookup example.com",
    },
    diagram: `client -> resolver -> root (.)        -> "ask .com"
                   -> TLD (.com)     -> "ask ns1.example.com"
                   -> authoritative  -> 93.184.216.34
answer cached for TTL seconds

NAT: 192.168.1.5:5000  <->  203.0.113.9:41230`,
    deepDive: [
      "DNS is a distributed, hierarchical, and heavily cached database. No single server knows every domain's IP; instead resolution walks down a tree from root servers (who only know where .com, .org, etc. name servers are) to TLD servers (who know where the domain's authoritative name server is) to the authoritative server (who actually answers with the IP). Caching at every layer, controlled by each record's TTL, is what makes this system fast in practice despite the number of hops on a cold lookup — most lookups are served from a resolver's cache and never touch the root or TLD servers.",
      "DHCP automates what would otherwise be manual IP configuration on every device. Its four-step DORA process (Discover, Offer, Request, Acknowledge) exists because a new device does not have an IP yet, so DISCOVER and OFFER happen over broadcast; REQUEST confirms the chosen offer (useful when multiple DHCP servers respond) and ACK finalizes the lease including IP, subnet mask, gateway and DNS servers. Leases expire and must be renewed, which is why a device can lose its IP if disconnected too long.",
      "NAT exists because IPv4 address space is scarce: a router with one public IP can front many private devices by rewriting the source IP and port of outgoing packets and keeping a translation table to route replies back to the correct internal host. This is why unsolicited inbound connections to a home network normally fail unless port forwarding is configured — the NAT table only exists for connections that were initiated from inside. NAT was a stopgap that outlived its original purpose; IPv6's huge address space removes the need for it, though carrier-grade NAT is still common today.",
    ],
    example: {
      title: "Resolving www.example.com from a cold cache",
      steps: [
        "Browser checks its own cache: empty, so it asks the OS resolver.",
        "Resolver has no cached record, so it asks a root server: 'who handles .com?'",
        "Root replies with the .com TLD server's address.",
        "Resolver asks the TLD server: 'who is authoritative for example.com?', gets ns1.example.com.",
        "Resolver asks ns1.example.com for the A record, gets 93.184.216.34, and caches it for the record's TTL.",
      ],
      result: "The browser receives 93.184.216.34 and opens a TCP connection to that IP; subsequent lookups within the TTL are served from cache instantly.",
    },
    mistakes: [
      { mistake: "Thinking DNS lookups always go all the way to the root server.", fix: "Most lookups are answered from cache at the browser, OS, or ISP resolver level; the full root-to-authoritative walk only happens on a cold cache." },
      { mistake: "Forgetting that lowering a TTL before a migration takes time to propagate.", fix: "Old cached answers with the previous TTL will still be served until they naturally expire, so lower the TTL well in advance of a planned IP change." },
      { mistake: "Assuming NAT provides security by hiding internal IPs.", fix: "NAT is an address-sharing mechanism, not a security feature; it has a side effect of blocking unsolicited inbound connections, but firewalls provide real security." },
    ],
    interviewQA: [
      { q: "Walk through what happens when you type a URL and hit Enter, focusing on DNS.", a: "The browser checks its cache, then the OS cache, then a configured resolver; if all miss, the resolver queries a root server for the TLD, the TLD server for the authoritative server, and the authoritative server for the final A/AAAA record, caching the result according to its TTL." },
      { q: "What problem does NAT solve and what is its main side effect?", a: "It lets many devices share one public IPv4 address by rewriting source IP/port in a translation table, conserving scarce IPv4 addresses; the side effect is that inbound connections to internal devices are blocked unless explicitly forwarded." },
      { q: "What are the four steps of DHCP?", a: "DISCOVER (client broadcasts a request), OFFER (server proposes an IP), REQUEST (client confirms the chosen offer), ACK (server finalizes the lease) — remembered as DORA." },
      { q: "What is a CNAME record used for?", a: "It aliases one domain name to another (e.g. www.example.com -> example.com), so the DNS resolver follows the chain to find the final A/AAAA record." },
    ],
    practice: [
      "Run `dig example.com A` and `dig example.com NS` and explain each line of the output.",
      "Explain in your own words why lowering DNS TTL before a server migration is good practice.",
      "Draw the DHCP DORA handshake with client and server messages.",
      "Explain why a device behind NAT cannot normally receive an unsolicited inbound connection.",
      "Look up the MX and TXT records for a domain of your choice and explain their purpose.",
    ],
  },

  "IP addressing & subnetting": {
    summary:
      "An IP address identifies a host; the subnet mask splits it into a network part and a host part. Subnetting carves one block into smaller networks.",
    keyPoints: [
      "IPv4 is 32 bits; /24 means 24 network bits, leaving 8 host bits.",
      "Usable hosts = 2^(32-prefix) - 2 (network and broadcast addresses are reserved).",
      "Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.",
      "CIDR replaced classful addressing; IPv6 is 128 bits with no NAT need.",
    ],
    syntax: {
      lang: "text",
      code: "192.168.10.0/26\nblock size 64 -> subnets .0, .64, .128, .192\nusable in first subnet: .1 to .62 (broadcast .63)",
    },
    diagram: `192.168.10.0/24  ->  split into four /26
 +-------------------------------------------+
 | .0-.63 | .64-.127 | .128-.191 | .192-.255 |
 +-------------------------------------------+
   net       net         net         net
 62 usable hosts each`,
    deepDive: [
      "An IPv4 address is 32 bits, conventionally written as four dotted decimal octets, and the subnet mask (or CIDR prefix like /24) tells you where the boundary is between the network portion (shared by all hosts on that LAN) and the host portion (unique per device). A smaller prefix number means a bigger network (more host bits, more addresses); a bigger prefix number means a smaller, more specific network. This single idea — split the bits, network on the left, host on the right — is the foundation of every subnetting question.",
      "Subnetting takes one large block and divides it into smaller equally-sized blocks by borrowing bits from the host portion to extend the network portion. Every subnet reserves its first address (network address, all host bits 0) and its last address (broadcast address, all host bits 1), which is why usable hosts is 2^(host bits) - 2, not 2^(host bits). This matters practically because a network engineer sizing subnets for departments (say 50, 20, and 10 hosts) needs to round each requirement up to the nearest power of two minus two and allocate accordingly, without wasting whole blocks.",
      "CIDR (Classless Inter-Domain Routing) replaced the old rigid Class A/B/C scheme, letting network boundaries fall anywhere rather than only at 8, 16, or 24 bits, which made address allocation far more efficient and also enabled route summarization (aggregating many small networks into one routing table entry). IPv6, with 128-bit addresses, was designed to make this address scarcity problem disappear entirely — the address space is astronomically large, so NAT is not needed for conservation (though it can still be used for other reasons), and every device can in principle have its own globally routable address.",
    ],
    example: {
      title: "Splitting 192.168.10.0/24 into subnets of at least 50 hosts each",
      steps: [
        "Need >= 50 usable hosts, so find smallest host-bit count h with 2^h - 2 >= 50: h=6 gives 62 usable hosts.",
        "6 host bits means the new prefix is 32-6 = /26.",
        "Block size = 2^6 = 64, so subnets start at .0, .64, .128, .192.",
        "First subnet 192.168.10.0/26: network .0, usable .1-.62, broadcast .63.",
        "Repeat for the remaining three /26 blocks the same way.",
      ],
      result: "One /24 becomes four /26 subnets, each supporting 62 usable hosts, enough for four departments needing about 50 hosts each.",
    },
    mistakes: [
      { mistake: "Forgetting to subtract 2 for the network and broadcast addresses when computing usable hosts.", fix: "Always compute usable hosts as 2^(host bits) - 2, not 2^(host bits)." },
      { mistake: "Assuming a smaller prefix number (e.g. /16) means a smaller network.", fix: "Prefix number is the count of network bits; fewer network bits (smaller prefix number) leaves more host bits, meaning a bigger network." },
      { mistake: "Mixing up private address ranges with public ones during exam questions.", fix: "Memorize the three private ranges (10/8, 172.16/12, 192.168/16); anything outside these is routable on the public internet." },
    ],
    interviewQA: [
      { q: "How many usable hosts are in a /27 network?", a: "32 - 27 = 5 host bits, so 2^5 - 2 = 30 usable hosts." },
      { q: "Why do we reserve the first and last address in a subnet?", a: "The first address (all host bits 0) identifies the network itself, and the last address (all host bits 1) is the broadcast address used to reach every host on that subnet; neither can be assigned to a single device." },
      { q: "What problem did CIDR solve compared to classful addressing?", a: "Classful addressing only allowed fixed network sizes (/8, /16, /24), wasting huge numbers of addresses for organizations that needed a size in between; CIDR allows arbitrary prefix lengths and route aggregation, using address space far more efficiently." },
      { q: "Why doesn't IPv6 need NAT the way IPv4 does?", a: "IPv6's 128-bit address space is large enough to give every device a unique globally routable address, removing the address-scarcity problem that made NAT necessary for IPv4." },
    ],
    practice: [
      "Compute the number of usable hosts for /28, /29, and /30 networks.",
      "Split 10.0.0.0/22 into four equally sized subnets and list each subnet's network, usable range, and broadcast address.",
      "Explain why 192.168.1.0/24 and 192.168.1.0/25 are different networks.",
      "Identify whether 172.20.5.10 is a private or public IP address.",
      "Practice converting a dotted-decimal subnet mask (like 255.255.255.192) to its CIDR prefix (/26).",
    ],
  },

  "Routing basics and switching": {
    summary:
      "Switches forward frames inside a LAN using MAC addresses; routers forward packets between networks using IP and a routing table.",
    keyPoints: [
      "Switch learns MAC-to-port mappings; broadcasts when unknown.",
      "Router picks the longest matching prefix in its routing table.",
      "Static routes are manual; dynamic protocols are RIP (hop count), OSPF (link state), BGP (between ISPs).",
      "ARP maps an IP to a MAC inside the same subnet.",
    ],
    syntax: {
      lang: "text",
      code: "destination      next hop\n10.0.1.0/24      direct\n0.0.0.0/0        192.168.1.1   <- default gateway",
    },
    diagram: ` PC-A --+          +-- PC-C
        [switch]--[router]--[internet]
 PC-B --+          +-- PC-D
 switch: MAC table, one broadcast domain
 router: IP table, separates broadcast domains`,
    deepDive: [
      "A switch operates purely on layer 2, learning which MAC address lives behind which physical port simply by observing source addresses on incoming frames, and building a MAC address table over time. When it does not yet know where a destination MAC is, it floods the frame out every port except the one it arrived on (like a hub would); once it learns the destination's port from a reply, subsequent frames are switched directly to that port only. All devices connected through switches (without a router between them) are in one broadcast domain, meaning a broadcast frame reaches everyone.",
      "A router operates at layer 3, using a routing table to decide the next hop for each packet based on the destination IP address, not the MAC address. The core routing algorithm is longest-prefix match: among all routing table entries that contain the destination address, the router picks the entry with the most specific (longest) prefix, because more specific routes represent more precise knowledge of where that traffic should go. A default route (0.0.0.0/0) is the catch-all fallback used when no more specific entry matches, typically pointing to the ISP or an upstream router.",
      "Routing tables can be built manually (static routes, fine for small or stable networks) or automatically by a routing protocol. Interior protocols like RIP (which simply counts hops, cheap but slow to converge and limited to small networks) and OSPF (which builds a full map of link costs and computes shortest paths, faster to converge and scales better) run within one organization's network. BGP is different in kind — it is the protocol that connects autonomous systems (ISPs, large organizations) to each other across the entire internet, making policy-based decisions rather than purely shortest-path ones. ARP fills the last gap: once a router or host knows the next-hop IP, it still needs the corresponding MAC address to actually put a frame on the local wire, and ARP resolves that by broadcasting 'who has this IP?' on the local subnet.",
    ],
    example: {
      title: "A packet leaving the LAN through a router",
      steps: [
        "PC-A (192.168.1.10) wants to reach a server on the internet, so it checks its own subnet mask and sees the destination is not local.",
        "PC-A sends the packet to its default gateway, using ARP first to find the gateway router's MAC address if not already cached.",
        "The switch forwards the Ethernet frame to the router's port based on its MAC address table.",
        "The router strips the Ethernet header, looks at the destination IP, and finds the longest matching prefix in its routing table (likely the default route 0.0.0.0/0).",
        "The router rebuilds a new Ethernet frame addressed to the next hop and forwards the IP packet onward, repeating this at each router until it reaches the destination network.",
      ],
      result: "The packet reaches the destination through possibly many routers, with the IP header essentially unchanged end-to-end while the MAC/Ethernet header is rebuilt at every hop.",
    },
    mistakes: [
      { mistake: "Thinking a switch makes forwarding decisions using IP addresses.", fix: "Switches use MAC addresses (layer 2); only routers use IP addresses (layer 3) to make forwarding decisions." },
      { mistake: "Assuming the shortest routing table entry (least specific) is always chosen.", fix: "Routers use longest-prefix match — the most specific matching route wins, even if a shorter/default route also matches." },
      { mistake: "Believing ARP works across different subnets.", fix: "ARP only resolves IP-to-MAC mappings within the same local subnet; traffic to other subnets is sent to the local gateway's MAC address instead." },
    ],
    interviewQA: [
      { q: "What is the difference between a switch and a router?", a: "A switch forwards frames within a LAN using MAC addresses and stays within one broadcast domain; a router forwards packets between different networks using IP addresses and separates broadcast domains." },
      { q: "What is longest-prefix matching and why is it used?", a: "When multiple routing table entries match a destination address, the router selects the entry with the most specific (longest) prefix, because it represents the most precise known route; this is used instead of picking the first or shortest match." },
      { q: "What is the difference between RIP, OSPF, and BGP?", a: "RIP is a simple distance-vector protocol using hop count, suitable only for small networks; OSPF is a link-state protocol that computes shortest paths using cost metrics and scales much better within one organization; BGP is a path-vector protocol used between autonomous systems across the internet, driven by policy as much as by path length." },
      { q: "What does ARP do and why is it needed even though we have IP addresses?", a: "ARP resolves an IP address to the corresponding MAC address on the local subnet, because Ethernet frames are ultimately delivered using MAC addresses, not IP addresses." },
    ],
    practice: [
      "Draw a small network with two switches and one router, and trace how a packet from one LAN reaches a host on the other LAN.",
      "Explain longest-prefix match with a routing table that has both 10.0.0.0/8 and 10.1.0.0/16 entries.",
      "Compare RIP, OSPF, and BGP in a short table (metric used, scope, convergence speed).",
      "Use `arp -a` (or `ip neigh`) on your machine and explain what the output means.",
      "Use `traceroute`/`tracert` to a website and identify how many router hops are involved.",
    ],
  },

  "Web security: CORS, XSS, CSRF": {
    summary:
      "The browser's same-origin policy isolates sites. CORS relaxes it deliberately; XSS and CSRF are the two attacks that abuse trust in the browser.",
    keyPoints: [
      "XSS injects script into a page — defend with output escaping and CSP, never with blacklists.",
      "CSRF makes the victim's browser send an authenticated request — defend with tokens and SameSite cookies.",
      "CORS is a server-declared allowlist (Access-Control-Allow-Origin), enforced by the browser only.",
      "A preflight OPTIONS request precedes non-simple cross-origin calls.",
    ],
    syntax: {
      lang: "http",
      code: "Access-Control-Allow-Origin: https://app.example.com\nSet-Cookie: sid=...; HttpOnly; Secure; SameSite=Strict",
    },
    diagram: `XSS                            CSRF
 attacker script runs           victim's cookie is reused
 inside YOUR page               by ATTACKER's page
 <script>steal(cookie)</script> <img src="/bank/transfer?to=x">
 fix: escape + CSP              fix: CSRF token + SameSite`,
    deepDive: [
      "The same-origin policy is the browser's default trust boundary: JavaScript running on one origin (scheme + host + port) cannot read responses from another origin unless that origin explicitly allows it. This is a defensive default that prevents a malicious site from silently reading your bank's page in another tab. CORS is the mechanism that lets a server opt in to being read cross-origin, by returning headers like Access-Control-Allow-Origin; critically, CORS is enforced entirely by the browser, so it protects browser users, not the server itself — a script or curl request outside a browser ignores CORS completely, which is a very common interview trap.",
      "XSS (cross-site scripting) happens when attacker-controlled input ends up being executed as script in the context of your page, most commonly because user input was inserted into HTML without escaping. Once that script runs, it runs with the same privileges as your own page's code, meaning it can read cookies, make authenticated requests, or rewrite the DOM. The correct fix is contextual output encoding (escape HTML/JS/URL contexts appropriately) plus a Content-Security-Policy header that restricts which scripts can execute at all; blacklisting specific strings like <script> is fragile because there are many ways to smuggle executable content past a naive filter.",
      "CSRF (cross-site request forgery) exploits the fact that browsers automatically attach cookies to requests regardless of which page triggered the request. If a user is logged into a banking site and visits a malicious page that silently submits a form or loads an image pointed at the bank's 'transfer money' endpoint, the browser will include the user's session cookie, and the bank's server cannot tell the request did not come from its own legitimate page. Defenses include CSRF tokens (a value that must be present in the request and cannot be guessed or supplied cross-site) and SameSite cookies (which tell the browser not to send the cookie on cross-site requests at all), often used together for defense in depth.",
    ],
    example: {
      title: "A CSRF attack and its fix",
      steps: [
        "Victim logs into bank.com; the browser stores a session cookie for bank.com.",
        "Victim visits evil.com in another tab, which contains a hidden form auto-submitting to bank.com/transfer?to=attacker&amount=1000.",
        "Because cookies are attached automatically per-domain, the browser sends the victim's bank.com session cookie along with the forged request.",
        "Without protection, bank.com processes the transfer because the request looks authenticated.",
        "With a CSRF token embedded in the legitimate form (which evil.com cannot read or guess) plus SameSite=Strict on the cookie, the forged request is rejected or the cookie is not sent at all.",
      ],
      result: "The forged transfer fails because the server requires a valid CSRF token that only the real bank.com page could have supplied, and/or the cookie was withheld for the cross-site request.",
    },
    mistakes: [
      { mistake: "Believing CORS is a security feature that protects the server from attackers.", fix: "CORS protects browser users by restricting what cross-origin JavaScript can read; it does nothing to stop non-browser clients like curl or server-to-server calls from hitting your API." },
      { mistake: "Trying to prevent XSS by blacklisting specific tags or words like <script>.", fix: "Use proper contextual output escaping for the context you're inserting data into (HTML, attribute, JS, URL) plus a Content-Security-Policy; blacklists are trivially bypassed." },
      { mistake: "Assuming HttpOnly cookies alone prevent CSRF.", fix: "HttpOnly only stops JavaScript from reading the cookie (helps against XSS-based cookie theft); it does not stop the browser from automatically attaching the cookie to a forged cross-site request, which is what CSRF tokens and SameSite address." },
    ],
    interviewQA: [
      { q: "What is the difference between XSS and CSRF?", a: "XSS injects and executes attacker script inside your own page, letting the attacker do anything your page's JavaScript could do; CSRF does not inject any script — it tricks the victim's browser into sending a legitimate-looking authenticated request to a target site using the victim's existing cookies." },
      { q: "Does enabling CORS make an API less secure?", a: "Not by itself — CORS only controls whether browser JavaScript on other origins can read the response; the API still needs its own authentication/authorization. Being overly permissive (Access-Control-Allow-Origin: *) combined with cookie-based auth can be risky, which is why credentialed requests require an explicit origin, not a wildcard." },
      { q: "How does SameSite cookie attribute help against CSRF?", a: "SameSite=Strict or Lax tells the browser not to send the cookie along with requests initiated from a different site, so a forged cross-site request arrives without the victim's session cookie and the server rejects it as unauthenticated." },
      { q: "What is a preflight request in CORS?", a: "For 'non-simple' cross-origin requests (custom headers, methods like PUT/DELETE, non-form content types), the browser first sends an OPTIONS request asking the server which methods/headers/origins are allowed, and only sends the real request if the server's response permits it." },
    ],
    practice: [
      "Explain why `Access-Control-Allow-Origin: *` cannot be combined with `Access-Control-Allow-Credentials: true`.",
      "Write a one-paragraph explanation distinguishing XSS, CSRF, and CORS for a non-technical teammate.",
      "List three places user input must be escaped differently (HTML body, HTML attribute, JavaScript string).",
      "Research what Content-Security-Policy header would block inline scripts, and write an example policy.",
      "Explain why SameSite=Strict cookies might break a legitimate cross-site redirect flow (e.g. payment gateway) and what SameSite=Lax changes.",
    ],
  },
};
