const blockchainProvider = require('../../services/blockchainProvider');

describe('BlockchainProvider', () => {
  describe('utility methods', () => {
    it('hashContent should return bytes32 hash', () => {
      const hash = blockchainProvider.hashContent({ id: 'abc', title: 'Test' });
      expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it('toBytes32 should keep valid bytes32 unchanged', () => {
      const input = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const output = blockchainProvider.toBytes32(input);
      expect(output).toBe(input);
    });
  });
});
