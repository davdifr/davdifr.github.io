---
layout: post
title: "Exploring digital credentials"
date: 2022-09-22 12:38:26 +0200
categories: digitalcredentials
---

When it comes to digital credentials, there are several alternatives we can consider and, in most cases, we will hear about **Verifiable Credentials** (VCs), **Open Badges** and **Blockcerts**.

Their goal is to provide a trustable **record of achievements** that can be shared on the Web, simplifying the interaction between three entities - issuer, holder and verifier - in a model called the **triangle of trusts** _(Figure 1)_.

![triangle-of-trusts](https://davdifr.github.io/assets/images/triangle-of-trusts.svg){:style="display:block; margin-left:auto; margin-right:auto"}

Once digital credentials are issued, the holder needs a **specific application as a vault** to store them. This application can reside on a user's device, can be hosted on a server, or could be a combination of both.

The purpose of this article is to analyze said alternatives individually to discover their peculiarities.

## Verifiable Credentials

VCs are an open standard defined by [W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model/), which provides a mechanism to express credentials in a way that is **cryptographically secure**, **privacy respecting** and **tamper-evident**.

Information is encrypted and protected by digital signatures hence **not readily visible** to everyone. Those in possess of the **public key** can verify the authenticity of the issuer and the holder.

VCs feature three main components: metadata, claims and issuer proof _(Figure 2)_.

![vc-components](https://davdifr.github.io/assets/images/vc-components.svg){:style="display:block; margin-left:auto; margin-right:auto"}

The **metadata** is used to describe properties like issuer, expiry date, representative image, and so on; a **claim** is a name-value statement about a subject (typically a person, but it could also be a thing) and the **issuer proof** is used to verify the integrity of a credential expressed as a digital signature (made with the private key of the issuer).

Here is an example:

```json
{
  "@context": [],
  "id": "e9ea3429-b32f-44ad-b481-b9929370bb90",
  "type": [ "VerifiableCredential", "DegreeCredential" ],
  "issuer": { "id": "did:example:2d28bb79-87a9-4224-8c63-d28b29716b67" },
  "issuanceDate": "2022-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:example:7564cb9c-165c-4857-a887-bfc2460af867",
		"degree": {
      "type": "BachelorDegree",
      "name": "Bachelor of Computer Science"
    }
   },
	"proof": { ... }
}
```

The code illustrates how the structure of the JSON is mapped to the components above. The Claim section, which begins with 'credentialSubject', indicates that the user has a computer science degree. The Issuer Proof part, not shown for space reasons, contains the cryptographic signature suite used to generate the signature (RSA, JWS, GPG, etc.) and its value.

An entity called **Verifiable Data Registry** (VDR) acts as an arbitrator and mediates the generation and verification of identifiers, keys, and other data _(Figure 3)_.

![vdr-flows](https://davdifr.github.io/assets/images/vdr-flows.svg){:style="display:block; margin-left:auto; margin-right:auto"}

VDR ensures that other entities respect the defined rules and this includes that: the credential conforms to the specification; the proof method is satisfied; and, if present, the status check succeeds. Otherwise, their requests will be denied.
Different ecosystems will have different VDRs with different sets of rules, which might mean that they are <u>unable to interoperate</u>.

## Open Badges

The [IMS Global Learning Consortium](https://openbadges.org) currently maintains the Open Badges standard (initially developed by the [Mozilla Foundation](https://foundation.mozilla.org/en/)), which describes a method to incorporate non-visible metadata in PNG or SVG image files _(Figure 4)_.

![open-badges](https://davdifr.github.io/assets/images/open-badges.svg){:style="display:block; margin-left:auto; margin-right:auto"}

An Open Badge image may contain a variety of data, including the badge's name, issuer, and description. All of this information is baked into the image, so only <u>Open Badge-compatible applications</u> can show it. Because of this visual representation, Open badges are **highly portable**.

Various organisations can implement Open Badges in their own way, subject to some mandatory properties that must be present to comply with the standard. Since there might be some variations in the implementation, the verification process is **dependent on the Issuer**.

The verification process can be done in two ways:

1. [Hosted Verification](https://www.imsglobal.org/sites/default/files/Badges/OBv2p0Final/index.html#HostedBadge) — One of the metadata properties of an Open Badge is the assertion id, a URL that host the metadata in a .json file. If this URL cannot be found, the badge is not verifiable.
2. [Signed Verification](https://www.imsglobal.org/sites/default/files/Badges/OBv2p0Final/index.html#SignedBadge) — Information is encrypted to ensure that the data has not been altered and that the issuer is the one who generated it. The public key used to sign the badge must be traceable to the issuer.

_Verifying Open Badges may require extra expenses such as a subscription/payment to use the verification tool and reliance on third-party providers._

A badge that can be confirmed via the hosted verification process looks like this:

```json
{
  "@context": "https://w3id.org/openbadges/v2",
  "type": "Assertion",
  "id": "https://example.org/assertion.json",
  "recipient": {
    "type": "email",
    "identity": "johndoe@example.org"
  },
  "image": "https://example.org/badge.png",
  "issuedOn": "2022-01-01T00:00:00Z",
  "badge": "https://example.org/type-of-badge-awarded.json",
  "verification": {
    "type": "hosted"
  }
}
```

Personal information (PII) included in Open Badge metadata may include last name, email address (like above), phone number and evidence. Most badge platforms do not display this data publicly, and the achievements can be secured through an authorization login. However, an Open Badge image file contains this information and can be opened and viewed.

In 2018, Mozilla recognized that badges alone do not attract users unless they are strongly linked to learning program offerings. For these reasons, they created the **Open Badge Infrastructure** (OBI), which allows developers to integrate badge services within existing applications, websites, or social networks through open APIs; enabling them to support third-party endorsements on issuer badges or personal badges.

## Blockcerts

Blockcerts is an open standard offered by [MIT Media Lab](https://www.media.mit.edu) used to digitally express a certificate and store it in a **blockchain** so that it can be always verified without the need to contact the issuing institution or platform _(Figure 5)_. Blockcerts aim to give individuals full control over their educational and professional credentials and provide institutions with a secure, tamper-proof way to issue and verify them.

![blockcert-workflow](https://davdifr.github.io/assets/images/blockcert-workflow.svg){:style="display:block; margin-left:auto; margin-right:auto"}

The blockchain contains the document's digital fingerprint ([hash](https://en.wikipedia.org/wiki/Cryptographic_hash_function)) and does **not store any private information**. The information recorded in the blockchain cannot be used to deduce the contents of the certificate but only the integrity.
Only the certificate's owner can choose to communicate the information on it with a third party, such as a potential employer.

Three repositories make up the architecture:

1. [Cert-schema](https://github.com/blockchain-certificates/cert-schema) — Describes the data standard for digital certificates. The schema was kept close to the Open Badge specification intentionally (forked from [IMSGlobal/cert-schema](https://github.com/IMSGlobal/cert-schema)).
2. [Cert-issuer](https://github.com/blockchain-certificates/cert-issuer) — Creates a hash of a certificate, issues it, and broadcasts a Bitcoin transaction from the issuer's address to a recipient's address, embedding it in the [OP_RETURN](https://en.bitcoin.it/wiki/OP_RETURN) field.
3. [Cert-viewer](https://github.com/blockchain-certificates/cert-verifier) — This allows users to view and verify digital certificates after they have been issued. The viewer code also allows users to request certificates and create new Bitcoin identities.

The verification process can take place both on the platforms that adopt the standard and via the default tool [Blockcerts Universal Verifier](https://www.blockcerts.org).

Storing data on the blockchain may require a large amount of computing power and financial costs. To increase the level of security and reduce the cost of these information processing operations, the standard aggregates all certificates issued that day and stores the electronic fingerprints as a single record by linking them mathematically ([Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree)).

In 2016, an article on [medium.com](https://medium.com) published by MIT Media Lab stated:

> The blockchain is not a simple solution that will fix everything that is wrong with today’s credentials. But it does offer some possibilities for improving the system we have today–and that’s what we are excited to explore.

## Comparison

Based on the previous observations, we can make a comparison table between the listed standards and thus get a more general view and a clearer picture of the situation.

| Feature                                 | Verifiable Credentials                         | Open Badges                                                                    | Blockcerts                                                                     |
| --------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Organization that governs the standards | W3C                                            | IMS Global and Mozilla Foundation                                              | MIT Media Lab                                                                  |
| Applications                            | Wide range of fields from healthcare to travel | Mostly in education and employment to some extent                              | Mostly in education                                                            |
| File Format                             | JSON - Human and machine readable              | PNG/SVG - Fixed image format                                                   | JSON - Machine readable and human readable with viewer                         |
| Tamper-evident                          | Yes                                            | No - Display could be changed, since data hosted elsewhere                     | Yes - Blockchain-enabled verification                                          |
| Verification                            | Built-in through digital signatures            | Requires third-party tools that could entail additional costs and dependencies | Requires a tool that can be implemented on platforms or found on the main page |

Everyone can see the benefits of reliable digital credentials, especially when they protect privacy and improve convenience for everyone involved. However, it is up to us whether those records will be accessible and verifiable independent of a particular vendor's infrastructure.

---

### References

- [W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model/)
- [Open Badges Specification](https://www.imsglobal.org/spec/ob/v2p1/)
- [Blockcerts - Quick start](https://www.blockcerts.org/guide/quick-start.html)
- [An Update on Badges and Backpack](https://medium.com/read-write-participate/an-update-on-badges-and-backpack-5a06fab252ea) - Mark Surman, Executive Director, Mozilla
- [Compare and Contrast: OpenBadges vs Verifiable Credentials](https://academy.affinidi.com/compare-and-contrast-openbadges-vs-verifiable-credentials-d504c054d5db) - Affinidi Pte. Ltd.
- [Open Badges as Verifiable Credentials](https://kayaelle.medium.com/in-the-w3c-vc-edu-call-on-june7-2021-we-discussed-open-badges-asserted-as-w3c-verifiable-90391cb9a7b7) - Kerri Lemoie
- [Clarification of the Verifiable Data Registry (VDR)](https://github.com/w3c/vc-data-model/issues/738) (GitHub issue)
- [Verifiable Credentials - how does it work? Understanding key VC principles](https://www.ubisecure.com/identity-management/verifiable-credentials-understanding-key-principles/) - Petteri Stenius
- [Blockcerts are friends of Open Badges](https://dajbelshaw.medium.com/blockcerts-are-friends-of-open-badges-4a331fea3f47) - Doug Belshaw
- [What we learned from designing an academic certificates system on the blockchain](https://medium.com/mit-media-lab/what-we-learned-from-designing-an-academic-certificates-system-on-the-blockchain-34ba5874f196#.4m4bmwcm0) - MIT Media Lab
