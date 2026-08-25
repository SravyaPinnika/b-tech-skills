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
  },
};
