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
