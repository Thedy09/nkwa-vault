# @version 0.4.1
"""
@title CulturalRegistry
@notice Minimal on-chain registry for cultural content certifications.
@dev Designed for gasless relayer flows so non-web3 users can publish via backend.
"""

owner: public(address)
total_certifications: public(uint256)

struct Certification:
    content_hash: bytes32
    metadata_cid: String[128]
    content_type: String[32]
    license_name: String[32]
    contributor: address
    timestamp: uint256
    exists: bool

certifications: public(HashMap[bytes32, Certification])

event ContentCertified:
    content_id: bytes32
    content_hash: bytes32
    metadata_cid: String[128]
    content_type: String[32]
    contributor: address
    timestamp: uint256

event ContentRecertified:
    content_id: bytes32
    content_hash: bytes32
    metadata_cid: String[128]
    content_type: String[32]
    contributor: address
    timestamp: uint256

event RewardRecorded:
    contributor: address
    points: uint256
    reason: String[64]
    timestamp: uint256


@deploy
def __init__():
    self.owner = msg.sender


@internal
def _content_key(content_id: String[64]) -> bytes32:
    return keccak256(_abi_encode(content_id))


@external
def certify_content(
    content_id: String[64],
    content_hash: bytes32,
    metadata_cid: String[128],
    content_type: String[32],
    license_name: String[32],
    contributor: address
):
    key: bytes32 = self._content_key(content_id)
    assert not self.certifications[key].exists, "already certified"

    self.certifications[key] = Certification({
        content_hash: content_hash,
        metadata_cid: metadata_cid,
        content_type: content_type,
        license_name: license_name,
        contributor: contributor,
        timestamp: block.timestamp,
        exists: True
    })
    self.total_certifications += 1

    log ContentCertified(
        key,
        content_hash,
        metadata_cid,
        content_type,
        contributor,
        block.timestamp
    )


@external
def recertify_content(
    content_id: String[64],
    content_hash: bytes32,
    metadata_cid: String[128],
    content_type: String[32],
    license_name: String[32],
    contributor: address
):
    key: bytes32 = self._content_key(content_id)
    assert self.certifications[key].exists, "not certified"

    self.certifications[key] = Certification({
        content_hash: content_hash,
        metadata_cid: metadata_cid,
        content_type: content_type,
        license_name: license_name,
        contributor: contributor,
        timestamp: block.timestamp,
        exists: True
    })

    log ContentRecertified(
        key,
        content_hash,
        metadata_cid,
        content_type,
        contributor,
        block.timestamp
    )


@view
@external
def get_content(content_id: String[64]) -> (
    bytes32,
    String[128],
    String[32],
    String[32],
    address,
    uint256,
    bool
):
    key: bytes32 = self._content_key(content_id)
    c: Certification = self.certifications[key]
    return (
        c.content_hash,
        c.metadata_cid,
        c.content_type,
        c.license_name,
        c.contributor,
        c.timestamp,
        c.exists
    )


@external
def record_reward(contributor: address, points: uint256, reason: String[64]):
    assert msg.sender == self.owner, "only owner"
    log RewardRecorded(contributor, points, reason, block.timestamp)

