# Vyper Contracts

This folder contains the on-chain registry used by Nkwa Vault.

## Contract

- `CulturalRegistry.vy`: stores cultural content certifications and emits events
  for rewards.

## Compile

```bash
vyper contracts/vyper/CulturalRegistry.vy
```

## Deploy

Deploy the compiled contract with your preferred EVM deployment tool, then set:

- `EVM_RPC_URL`
- `EVM_CHAIN_ID`
- `EVM_NETWORK`
- `EVM_RELAYER_PRIVATE_KEY`
- `EVM_REGISTRY_CONTRACT`

in backend environment variables.
