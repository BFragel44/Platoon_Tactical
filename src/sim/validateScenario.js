const REQUIRED_COLLECTIONS = [
  "factions",
  "locations",
  "soldiers",
  "teams",
  "contacts",
  "contact_generation_profiles",
  "enemy_force_packages",
];

function assert(condition, message) {
  if (!condition) {
    throw new TypeError(`Invalid scenario: ${message}`);
  }
}

function assertUniqueIds(items, collectionName) {
  const ids = items.map((item) => item.id);
  assert(ids.every(Boolean), `${collectionName} must have non-empty IDs`);
  assert(new Set(ids).size === ids.length, `${collectionName} IDs must be unique`);
  return new Set(ids);
}

export function validateScenario(scenario) {
  assert(scenario && typeof scenario === "object", "scenario must be an object");
  assert(typeof scenario.id === "string" && scenario.id.length > 0, "id is required");

  for (const collectionName of REQUIRED_COLLECTIONS) {
    assert(Array.isArray(scenario[collectionName]), `${collectionName} must be an array`);
  }

  const factionIds = assertUniqueIds(scenario.factions, "faction");
  const locationIds = assertUniqueIds(scenario.locations, "location");
  const soldierIds = assertUniqueIds(scenario.soldiers, "soldier");
  const teamIds = assertUniqueIds(scenario.teams, "team");
  assertUniqueIds(scenario.contacts, "contact");
  const generationProfileIds = assertUniqueIds(
    scenario.contact_generation_profiles,
    "contact generation profile",
  );
  const packageIds = assertUniqueIds(scenario.enemy_force_packages, "enemy force package");

  assert(factionIds.has(scenario.player_faction_id), "player_faction_id must reference a faction");

  for (const location of scenario.locations) {
    assert(Array.isArray(location.connected_location_ids), `${location.id} connections must be an array`);
    for (const connectedId of location.connected_location_ids) {
      assert(locationIds.has(connectedId), `${location.id} references unknown location ${connectedId}`);
      const connected = scenario.locations.find((candidate) => candidate.id === connectedId);
      assert(
        connected.connected_location_ids.includes(location.id),
        `${location.id} and ${connectedId} connections must be bidirectional`,
      );
    }
  }

  for (const soldier of scenario.soldiers) {
    assert(factionIds.has(soldier.faction_id), `${soldier.id} references an unknown faction`);
    assert(teamIds.has(soldier.team_id), `${soldier.id} references an unknown team`);
  }

  for (const team of scenario.teams) {
    assert(factionIds.has(team.faction_id), `${team.id} references an unknown faction`);
    assert(locationIds.has(team.location_id), `${team.id} references an unknown location`);
    assert(Array.isArray(team.member_ids), `${team.id} member_ids must be an array`);
    for (const soldierId of team.member_ids) {
      assert(soldierIds.has(soldierId), `${team.id} references unknown soldier ${soldierId}`);
      const soldier = scenario.soldiers.find((candidate) => candidate.id === soldierId);
      assert(soldier.team_id === team.id, `${soldierId} must reference ${team.id}`);
      assert(soldier.faction_id === team.faction_id, `${soldierId} must share ${team.id}'s faction`);
    }
  }

  for (const contact of scenario.contacts) {
    assert(locationIds.has(contact.location_id), `${contact.id} references an unknown location`);
    assert(
      generationProfileIds.has(contact.generation_profile_id),
      `${contact.id} references an unknown generation profile`,
    );
  }

  for (const profile of scenario.contact_generation_profiles) {
    assert(Array.isArray(profile.results) && profile.results.length > 0, `${profile.id} needs results`);
    for (const result of profile.results) {
      assert(Number.isFinite(result.weight) && result.weight > 0, `${profile.id} weights must be positive`);
      if (result.result === "NO_CONTACT") {
        assert(result.package_id === null, `${profile.id} NO_CONTACT must not reference a package`);
      } else {
        assert(packageIds.has(result.package_id), `${profile.id} references an unknown package`);
      }
    }
  }

  for (const enemyPackage of scenario.enemy_force_packages) {
    assert(factionIds.has(enemyPackage.faction_id), `${enemyPackage.id} references an unknown faction`);
    assert(
      Array.isArray(enemyPackage.soldiers) && enemyPackage.soldiers.length > 0,
      `${enemyPackage.id} needs soldiers`,
    );
  }

  return scenario;
}
