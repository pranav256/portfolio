---
title: "Local first, by design."
description: "What a password vault makes you think about before you draw the first screen."
date: "2026-11-05"
category: "Systems"
featured: false
---

A password manager has an unusual job: make important information easy to reach for one person and difficult to reach for everyone else.

The [Password-Manager repository](https://github.com/pranav256/Password-Manager) brings together Rust, egui, Argon2id, and AES-256-GCM. Those choices are a starting point for thinking about a local desktop vault. They are not, on their own, a security guarantee.

## Start with the boundaries

Before choosing a layout, ask where the data lives, when it is decrypted, and what happens when the application locks.

These are interface questions as much as implementation questions. A lock button should describe a real change in state. A backup action should explain what is being exported. An error should help the person recover without accidentally revealing sensitive information.

The useful exercise is to name the threat model. Protecting a stolen vault file is different from protecting secrets on a machine that is already compromised.

## A password is not an encryption key

Human passwords have uneven strength. A password-based key derivation function turns a password and a salt into key material while making repeated guesses more expensive.

Argon2id is designed for this job. Its memory and time parameters need to be selected and measured for the devices an application supports. A setting that is appropriate on a desktop may feel very different on a slower machine.

The user experience matters here too. Derivation should have an honest loading state. A slow unlock should not look like a frozen program.

## Encryption should also detect modification

AES-256-GCM provides authenticated encryption: with the correct use of keys and nonces, it protects the content and detects changes to the ciphertext.

That qualification matters. Nonces must be unique for a given key. Authentication failures need to stop decryption cleanly. Error paths deserve the same attention as the happy path.

Choosing established, maintained cryptographic libraries is preferable to implementing these primitives from scratch.

## Local storage changes the responsibility

Keeping a vault on a device reduces dependence on a remote account. It also makes recovery and backups especially important.

A good interface should make those consequences understandable before someone needs to recover their data. Recovery is a design decision to make deliberately, not an assumption to leave to a reassuring icon.

These are design notes inspired by the repository's stated stack, not an independent security audit or a list of verified implementation properties.

[Explore Password Manager ↗](https://github.com/pranav256/Password-Manager)
