---
title: "Building RustyVault: a password manager in Rust"
description: "Moving from a Python text file to an encrypted desktop vault, including migration, file persistence, key handling, and release packaging."
date: "2026-11-06"
category: "Systems"
featured: true
---

RustyVault grew out of a Python password manager that stored credentials in a text file. Rebuilding it in Rust meant changing the storage format and carrying old accounts forward. The desktop interface also needed real locked and unlocked states.

The repository is still named [Password-Manager](https://github.com/pranav256/Password-Manager). Its Rust history starts with a scaffold on 1 September 2026. Release work followed on 15 September, then an architecture handover in November. The commits make the order of construction unusually clear: cryptography, vault storage, migration, password generation, interface, then packaging.

## The old file format shaped the rewrite

The [handover document](https://github.com/pranav256/Password-Manager/blob/15284f85fb4acd383df74ce5f4108106c720cd94/HANDOVER.md) describes the predecessor as a Python/PyQt5 application. Its legacy `emails.txt` format shifted character values by five.

That transformation is reversible without a secret key. The encrypted vault needed a new file format. Migration had to understand the original format well enough to recover existing entries.

Rust also changed distribution. The finished application uses egui and eframe for its native interface, so running it does not require a Python interpreter and PyQt installation. It still has Rust crate dependencies and platform requirements; the benefit is a different deployment model.

## Separate the encryption from the account data

The [crypto module](https://github.com/pranav256/Password-Manager/blob/15284f85fb4acd383df74ce5f4108106c720cd94/src/crypto.rs) handles key derivation, random salts and nonces, encryption, and decryption. The vault module handles account entries and persistence. The interface coordinates them.

The encrypted file is a JSON envelope with four fields:

~~~text
version
salt
nonce
ciphertext
~~~

The salt is 16 bytes. Argon2id derives a 32-byte key from the master password and that salt. AES-256-GCM combines the Advanced Encryption Standard with Galois/Counter Mode to encrypt data and detect changes. It uses a fresh 12-byte random nonce.

The salt and nonce are stored with the ciphertext so the application can open the file again. The master password and derived key are not serialized into that envelope.

The derived key sits inside a `DerivedKey` wrapper that implements zeroization on drop. The [key-wrapper commit](https://github.com/pranav256/Password-Manager/commit/a7f3f4d03d3cc8872467e2be2b9ada41d94f3e91) made that lifetime explicit early in the build.

Decryption checks nonce length and returns an error when authentication fails. The current crypto tests exercise an encryption/decryption round trip and rejection of a wrong password. Those are useful checks of concrete behavior; they cover only part of the file-handling and memory-lifetime questions.

## A save needed more than encryption

The [vault module](https://github.com/pranav256/Password-Manager/blob/15284f85fb4acd383df74ce5f4108106c720cd94/src/vault.rs) serializes entries, encrypts them, attaches the vault salt, and writes the envelope.

It uses a temporary file followed by a rename:

~~~text
Serialize account data
  -> encrypt the serialized bytes
  -> write vault.tmp
  -> rename it to vault.enc
~~~

That keeps the final path from being written incrementally with a half-finished JSON document. Filesystem behavior still matters, including replacement semantics and whether data has reached durable storage.

A very practical bug appeared in this area. The [7 September fix](https://github.com/pranav256/Password-Manager/commit/c2ec7fa1b718b061609ed3a2f0f6ba6be0aa68c5) ensured the parent directory existed before writing.

The application chooses a platform-specific local data directory through the `directories` crate. On a first run, that directory may not exist yet. Encryption can succeed in memory and the save can still fail because there is nowhere to put the file. Creating the parent directory was part of completing the new-vault workflow.

## Migration had to preserve the old assumptions

The importer was built across several September commits: [parsing the legacy file](https://github.com/pranav256/Password-Manager/commit/9043d32e71cc7b47bb2a27f46cf62068e6c89a90), then [adding character-shift decoding](https://github.com/pranav256/Password-Manager/commit/0304661d49ddec4d45d0447ba915a8f0f8b41894).

The current importer reads lines, splits them on commas, and uses the first three fields for username, email, and password. It reverses the shift and creates a vault entry with a service name derived from the recovered username.

Import is available from the locked view. The user supplies a master password so the imported accounts can be written into the encrypted format.

There are limits to this implementation. Comma splitting does not support quoted fields containing commas. The character conversion also passes through an eight-bit value, so arbitrary Unicode needs closer examination. Successful import does not remove the old text file.

Those details matter when changing a storage format. The import operation has to preserve data across the boundary, and its accepted input format needs to be stated precisely.

## Locking became an application state transition

The interface was built after the crypto, vault, and generator modules. That order kept the underlying operations available without depending on widgets.

The new-vault screen gained [master-password confirmation](https://github.com/pranav256/Password-Manager/commit/0f1fdb044c25dc7010b278f75113af7da12ff452). Failed unlock attempts gained an [inline error banner](https://github.com/pranav256/Password-Manager/commit/cf53c17f3e9ce1858e2576a094141ed3badef009).

The unlocked view then added search, entry actions, clipboard copying, notifications, and account editing. Search is a case-insensitive substring match across service, username, email, and notes. The actual implementation is more specific than the README's “fuzzy search” label.

The [lock implementation](https://github.com/pranav256/Password-Manager/commit/97704d179449a1ea07610705bb461520755a9c23) sets the app to locked, drops the in-memory vault and key, clears the password input fields, and closes the entry dialog.

Dropping the key invokes its zeroization wrapper. The other strings require separate attention: ordinary string clearing or dropping is not a promise to overwrite every plaintext copy. Clipboard contents and dialog state also have their own lifetimes.

## Password generation required enforceable rules

The generator uses the operating system's random source and configurable character pools. It chooses at least one character from each enabled group, fills the remaining positions, then shuffles the result. The length has a minimum of eight characters.

The [guaranteed-character change](https://github.com/pranav256/Password-Manager/commit/f0f63be2975045dffbab5ffa48af0e03850f4173) addressed a subtle requirement: enabling numbers should result in a password containing a number. Merely adding digits to the random pool does not guarantee that.

A later option filtered ambiguous characters such as `0`, `O`, `1`, and `l`. The interface eventually exposed the length slider and character-group checkboxes in a dedicated generator dialog.

The strength meter uses an estimate based on password length and the inferred character pool:

~~~text
estimated bits = length × log2(character pool size)
~~~

That estimate assumes a style of random selection. It does not identify dictionary phrases, repeated patterns, or whether a password has appeared in a breach. A reassuring strength label needs to be read with those limits in mind.

## Packaging was another part of the build

On 14 September, the repository added [formatting, Clippy, and test checks](https://github.com/pranav256/Password-Manager/commit/31c9491d3617a35f53037d2a326d56c6d733fcef). On 15 September, it added an [automated release workflow](https://github.com/pranav256/Password-Manager/commit/60744168901662593f27ecfeed0c05df96d3f8a6) for Windows, Linux, and macOS.

This followed the interface work rather than replacing it. Compiling the application and giving someone a usable downloadable artifact are separate steps. Release metadata and distribution documentation followed during the v0.1.0 milestone.

The November handover recorded the architecture and development sequence. It provides context for the rewrite, while the source gives the more precise account of individual behaviors.

## What I would tighten next

The most concrete remaining issue is save-error handling. Several interface paths discard `save_to_file` errors with `let _ =`. An operation can update the in-memory list while its write to disk fails. That needs an explicit error and a way to recover before a success message can be trusted.

The persistence code uses write-and-rename without an explicit sync step. The import format needs stronger validation. Plaintext buffers, copied secrets, and dialog state need a broader lifetime review than the derived-key wrapper alone provides.

The release is useful evidence of packaging work. The next round of validation should focus on failed saves, malformed vault files, migration edge cases, and the complete create-lock-reopen workflow on each supported platform.

[Read the RustyVault source](https://github.com/pranav256/Password-Manager/tree/15284f85fb4acd383df74ce5f4108106c720cd94) and [commit history](https://github.com/pranav256/Password-Manager/commits/main/). This article describes the public implementation reviewed on 6 November 2026 and distinguishes implemented behavior from the remaining work.
