export const m0TestScenario = {
  id: "m0_contact_test",
  player_faction_id: "friendly",
  factions: [
    {
      id: "friendly",
      known_location_ids: ["loc_orchard_edge", "loc_lane"],
    },
    {
      id: "enemy",
      known_location_ids: [],
    },
  ],
  locations: [
    {
      id: "loc_orchard_edge",
      name: "Orchard Edge",
      connected_location_ids: ["loc_lane"],
      tactical_tags: ["CONCEALED_APPROACH"],
    },
    {
      id: "loc_lane",
      name: "Sunken Lane",
      connected_location_ids: ["loc_orchard_edge", "loc_crossroads", "loc_farmyard"],
      tactical_tags: ["LOW_GROUND"],
    },
    {
      id: "loc_crossroads",
      name: "Crossroads",
      connected_location_ids: ["loc_lane", "loc_stone_house"],
      tactical_tags: ["EXPOSED"],
    },
    {
      id: "loc_farmyard",
      name: "Farmyard",
      connected_location_ids: ["loc_lane", "loc_stone_house"],
      tactical_tags: ["BUILT_UP"],
    },
    {
      id: "loc_stone_house",
      name: "Stone House",
      connected_location_ids: ["loc_crossroads", "loc_farmyard", "loc_ridge"],
      tactical_tags: ["STRUCTURE"],
    },
    {
      id: "loc_ridge",
      name: "Low Ridge",
      connected_location_ids: ["loc_stone_house"],
      tactical_tags: ["ELEVATED"],
    },
  ],
  soldiers: [
    {
      id: "soldier_hayes",
      name: "Cpl. David Hayes",
      faction_id: "friendly",
      team_id: "team_alpha",
      role_tags: ["TEAM_LEADER"],
      capability_tags: ["LEADERSHIP"],
      weapon_category: "RIFLE",
    },
    {
      id: "soldier_morgan",
      name: "Pfc. Lena Morgan",
      faction_id: "friendly",
      team_id: "team_alpha",
      role_tags: ["AUTOMATIC_RIFLEMAN"],
      capability_tags: ["AUTOMATIC_FIRE"],
      weapon_category: "LIGHT_AUTOMATIC_WEAPON",
    },
    {
      id: "soldier_ortiz",
      name: "Pfc. Mateo Ortiz",
      faction_id: "friendly",
      team_id: "team_alpha",
      role_tags: ["GRENADIER"],
      capability_tags: ["AREA_FIRE"],
      weapon_category: "RIFLE_GRENADE_LAUNCHER",
    },
    {
      id: "soldier_brooks",
      name: "Pvt. Ellis Brooks",
      faction_id: "friendly",
      team_id: "team_alpha",
      role_tags: ["RIFLEMAN"],
      capability_tags: [],
      weapon_category: "RIFLE",
    },
  ],
  teams: [
    {
      id: "team_alpha",
      name: "Alpha Team",
      faction_id: "friendly",
      coarse_type: "FIRETEAM",
      observation_experience: "NORMAL",
      member_ids: ["soldier_hayes", "soldier_morgan", "soldier_ortiz", "soldier_brooks"],
      location_id: "loc_orchard_edge",
    },
  ],
  contacts: [
    {
      id: "contact_stone_house",
      location_id: "loc_stone_house",
      trigger: { type: "FRIENDLY_ENTERS_LOCATION" },
      generation_profile_id: "enemy_fireteam_unknown",
    },
  ],
  contact_generation_profiles: [
    {
      id: "enemy_fireteam_unknown",
      results: [
        { result: "NO_CONTACT", weight: 1, package_id: null },
        { result: "RIFLE_TEAM", weight: 1, package_id: "RIFLE_TEAM" },
        {
          result: "AUTOMATIC_WEAPONS_TEAM",
          weight: 1,
          package_id: "AUTOMATIC_WEAPONS_TEAM",
        },
        {
          result: "REINFORCED_RIFLE_TEAM",
          weight: 1,
          package_id: "REINFORCED_RIFLE_TEAM",
        },
      ],
    },
  ],
  enemy_force_packages: [
    {
      id: "RIFLE_TEAM",
      name: "Enemy Rifle Team",
      faction_id: "enemy",
      observation_experience: "NORMAL",
      soldiers: [
        { name: "Enemy Team Leader", role_tags: ["TEAM_LEADER"], weapon_category: "RIFLE" },
        { name: "Enemy Rifleman", role_tags: ["RIFLEMAN"], weapon_category: "RIFLE" },
      ],
    },
    {
      id: "AUTOMATIC_WEAPONS_TEAM",
      name: "Enemy Automatic Weapons Team",
      faction_id: "enemy",
      observation_experience: "NORMAL",
      soldiers: [
        {
          name: "Enemy Automatic Rifleman",
          role_tags: ["AUTOMATIC_RIFLEMAN"],
          capability_tags: ["AUTOMATIC_FIRE"],
          weapon_category: "LIGHT_AUTOMATIC_WEAPON",
        },
        {
          name: "Enemy Assistant",
          role_tags: ["ASSISTANT"],
          weapon_category: "RIFLE",
        },
      ],
    },
    {
      id: "REINFORCED_RIFLE_TEAM",
      name: "Enemy Reinforced Rifle Team",
      faction_id: "enemy",
      observation_experience: "NORMAL",
      soldiers: [
        { name: "Enemy Team Leader", role_tags: ["TEAM_LEADER"], weapon_category: "RIFLE" },
        {
          name: "Enemy Automatic Rifleman",
          role_tags: ["AUTOMATIC_RIFLEMAN"],
          capability_tags: ["AUTOMATIC_FIRE"],
          weapon_category: "LIGHT_AUTOMATIC_WEAPON",
        },
        { name: "Enemy Rifleman", role_tags: ["RIFLEMAN"], weapon_category: "RIFLE" },
      ],
    },
  ],
};

const additionalNames = {
  bravo: ['Sgt. Ruth Ellis', 'Pfc. Sam Reed', 'Pfc. Owen Park', 'Pvt. Ada Bell'],
  charlie: ['Cpl. Noah Price', 'Pfc. June West', 'Pfc. Ivan Cole', 'Pvt. Maya Stone'],
};
for (const [name, names] of Object.entries(additionalNames)) {
  const members = m0TestScenario.soldiers.slice(0, 4).map((soldier, index) => ({
    ...structuredClone(soldier), id: `soldier_${name}_${index}`, name: names[index], team_id: `team_${name}`,
  }));
  m0TestScenario.soldiers.push(...members);
  m0TestScenario.teams.push({ ...structuredClone(m0TestScenario.teams[0]),
    id: `team_${name}`, name: `${name[0].toUpperCase()}${name.slice(1)} Team`, member_ids: members.map(s => s.id) });
}
const terrain = {
  loc_orchard_edge: [2, 0.8, [], 'Staging area; safe from the house'],
  loc_lane: [1, 0.7, ['loc_crossroads'], 'Covered approach'],
  loc_crossroads: [0, 0.4, ['loc_lane', 'loc_stone_house', 'loc_ridge'], 'Exposed direct approach and support position'],
  loc_farmyard: [2, 0.8, ['loc_stone_house'], 'Protected flank; opens fire on the house'],
  loc_stone_house: [2, 0.65, ['loc_crossroads', 'loc_farmyard', 'loc_ridge'], 'Objective; strong defensive position'],
  loc_ridge: [1, 0.6, ['loc_crossroads', 'loc_stone_house'], 'Rear defensive position'],
};
for (const location of m0TestScenario.locations) {
  const [protection, cover_chance, fire_location_ids, description] = terrain[location.id];
  Object.assign(location, { protection, cover_chance, fire_location_ids, description,
    cover_capacity: 1, cover_bonus: 2 });
}
m0TestScenario.leader = { id: 'leader_walker', name: 'Lt. Alex Walker', team_id: 'team_alpha', condition: 'EFFECTIVE' };
m0TestScenario.objective = { location_id: 'loc_stone_house', name: 'Secure Stone House', turn_limit: 24 };
m0TestScenario.briefing = 'Secure Stone House and hold it through the following turn. Establish supporting fire at the crossroads, maneuver through the farmyard, and keep a team available to recover or reinforce. You may abort at any time.';
m0TestScenario.contacts = [{ id: 'contact_approach', location_id: 'loc_crossroads',
  trigger_location_ids: ['loc_crossroads', 'loc_farmyard', 'loc_stone_house'], placement_location_ids: ['loc_stone_house'],
  trigger: { type: 'FRIENDLY_ENTERS_LOCATION' }, generation_profile_id: 'enemy_fireteam_unknown' }];
export const knownDefenderScenario = structuredClone(m0TestScenario);
knownDefenderScenario.id = 'm0_known_defender';
knownDefenderScenario.known_defender = true;
knownDefenderScenario.briefing = 'Training: an identified automatic-weapons team holds Stone House. Use Alpha to establish fire, Bravo to approach through the farmyard, and Charlie as reserve. Secure the house and hold it through the following turn.';
export const scenarios = { uncertain: m0TestScenario, training: knownDefenderScenario };
