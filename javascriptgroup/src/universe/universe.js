// Auto-generated baseline port of universe.h
// NOTE: This maps many C macros/types to JS exports; it is not a full semantic port.

// --- Function-like macros from the original C headers ---
// universe.h: #define METRES_TO_APESPACE(m) (m*m*80000)
// Use a function declaration (hoisted) so constants below can safely reference it.
export function METRES_TO_APESPACE(m) {
  return (m * m * 80000);
}

export const SINGLE_BRAIN = (32768);
export const DOUBLE_BRAIN = (SINGLE_BRAIN*2);
export const CHARACTER_WIDTH = (8);
export const CHARACTER_HEIGHT = (14);
export const AGE_OF_MATURITY = (30);
export const FISHING_PROB = (1<<8);
export const SHOUT_RANGE = METRES_TO_APESPACE(50);
export const SHOUT_REFRACTORY = 10;
export const THRESHOLD_SEEK_MATE = 100;
export const GESTATION_SEX_DRIVE_DECREMENT = 16;
export const FATIGUE_SPEED_THRESHOLD = 8;
export const ANECDOTE_EVENT_MUTATION_RATE = 5000;
export const ANECDOTE_AFFECT_MUTATION_RATE = 5000;
export const SOCIAL_FORGET_DAYS = 10;
export const SOCIAL_RANGE = METRES_TO_APESPACE(10);
export const SQUABBLE_RANGE = METRES_TO_APESPACE(5);
export const MATING_RANGE = METRES_TO_APESPACE(5);
export const SOCIAL_TOLLERANCE = 1;
export const MIN_CROWDING = 1;
export const MAX_CROWDING = 3;
export const BEING_MAX_MASS_G = 7000;
export const BEING_MAX_MASS_FAT_G = (BEING_MAX_MASS_G>>2);
export const BEING_MAX_HEIGHT_MM = 2000;
export const BEING_MAX_HEIGHT = 65535;
export const BIRTH_HEIGHT = 2000;
export const BIRTH_MASS = 100;
export const EVENT_INTENTION = (128);
export const THROW_ACCURACY = (1<<15);
export const WHACK_ACCURACY = (1<<15);
export const PAIR_BOND_THRESHOLD = 2;
export const MAX_FEATURESET_SIZE = 16;
export const MAX_FEATURE_FREQUENCY = 2048;
export const MAX_FEATURESET_OBSERVATIONS = 2048;
export const SOCIAL_SIZE = 12;
export const SOCIAL_SIZE_BEINGS = (SOCIAL_SIZE>>1);
export const EPISODIC_SIZE = 12;
export const OVERRIDE_GOAL = 1;
export const GOAL_TIMEOUT = (60*24);
export const GOAL_RADIUS = 40000;
export const DRIVES_MAX = 255;
export const CHROMOSOMES = 4;
export const CHROMOSOME_Y = 0;
export const IMMUNE_ANTIGENS = 8;
export const IMMUNE_POPULATION = 16;
export const NUMBER_OF_BODIES = (10);
export const LARGE_SIM = 256;
export const SEX_FEMALE = 3;

export class simulated_file_definition {
  constructor(init = {}) {
    this.contents = init.contents ?? 0;
    this.value = init.value ?? 0;
    this.number = init.number ?? 0;
  }
}

export class simulated_feature {
  constructor(init = {}) {
    this.value = init.value ?? 0;
    this.frequency = init.frequency ?? 0;
    this.type = init.type ?? 0;
  }
}

export class simulated_featureset {
  constructor(init = {}) {
    this.feature_number = init.feature_number ?? 0;
    this.features = init.features ?? [];
    this.observations = init.observations ?? 0;
  }
}

export class simulated_isocial {
  constructor(init = {}) {
    this.space_time = init.space_time ?? 0;
    this.first_name = init.first_name ?? [];
    this.family_name = init.family_name ?? [];
    this.attraction = init.attraction ?? 0;
    this.friend_foe = init.friend_foe ?? 0;
    this.belief = init.belief ?? 0;
    this.familiarity = init.familiarity ?? 0;
    this.relationship = init.relationship ?? 0;
    this.entity_type = init.entity_type ?? 0;
    this.classification = init.classification ?? 0;
    this.braincode = init.braincode ?? [];
  }
}

export class simulated_iepisodic {
  constructor(init = {}) {
    this.space_time = init.space_time ?? 0;
    this.first_name = init.first_name ?? [];
    this.family_name = init.family_name ?? [];
    this.event = init.event ?? 0;
    this.food = init.food ?? 0;
    this.affect = init.affect ?? 0;
    this.arg = init.arg ?? 0;
  }
}

export class simulated_iplace {
  constructor(init = {}) {
    this.name = init.name ?? 0;
    this.familiarity = init.familiarity ?? 0;
  }
}

export class simulated_ibrain_probe {
  constructor(init = {}) {
    this.type = init.type ?? 0;
    this.position = init.position ?? 0;
    this.address = init.address ?? 0;
    this.frequency = init.frequency ?? 0;
    this.offset = init.offset ?? 0;
    this.state = init.state ?? 0;
  }
}

export class simulated_immune_system {
  constructor(init = {}) {
    this.antigens = init.antigens ?? [];
    this.shape_antigen = init.shape_antigen ?? [];
    this.antibodies = init.antibodies ?? [];
    this.shape_antibody = init.shape_antibody ?? [];
    this.random_seed = init.random_seed ?? [];
  }
}

export class simulated_idead_body {
  constructor(init = {}) {
    this.location = init.location ?? [];
  }
}

export class simulated_remains {
  constructor(init = {}) {
    this.bodies = init.bodies ?? [];
    this.count = init.count ?? 0;
    this.location = init.location ?? 0;
  }
}

export class simulated_being_constant {
  constructor(init = {}) {
    this.date_of_birth = init.date_of_birth ?? 0;
    this.generation_min = init.generation_min ?? 0;
    this.generation_max = init.generation_max ?? 0;
    this.name = init.name ?? [];
    this.genetics = init.genetics ?? [];
  }
}

export class simulated_being_delta {
  constructor(init = {}) {
    this.location = init.location ?? [];
    this.direction_facing = init.direction_facing ?? 0;
    this.velocity = init.velocity ?? [];
    this.stored_energy = init.stored_energy ?? 0;
    this.random_seed = init.random_seed ?? [];
    this.macro_state = init.macro_state ?? 0;
    this.parasites = init.parasites ?? 0;
    this.honor = init.honor ?? 0;
    this.crowding = init.crowding ?? 0;
    this.height = init.height ?? 0;
    this.mass = init.mass ?? 0;
    this.posture = init.posture ?? 0;
    this.goal = init.goal ?? [];
    this.social_coord_x = init.social_coord_x ?? 0;
    this.social_coord_y = init.social_coord_y ?? 0;
    this.social_coord_nx = init.social_coord_nx ?? 0;
    this.social_coord_ny = init.social_coord_ny ?? 0;
    this.awake = init.awake ?? 0;
    this.total_movement = init.total_movement ?? 0;
  }
}

export class simulated_being_events {
  constructor(init = {}) {
    this.social = init.social ?? [];
    this.episodic = init.episodic ?? [];
    this.territory = init.territory ?? [];
  }
}

export class simulated_being_volatile {
  constructor(init = {}) {
    this.drives = init.drives ?? [];
    this.shout = init.shout ?? [];
    this.inventory = init.inventory ?? [];
    this.learned_preference = init.learned_preference ?? [];
    this.date_of_conception = init.date_of_conception ?? 0;
    this.fetal_genetics = init.fetal_genetics ?? [];
    this.father_name = init.father_name ?? [];
    this.mother_name = init.mother_name ?? [];
    this.child_generation_min = init.child_generation_min ?? 0;
    this.child_generation_max = init.child_generation_max ?? 0;
  }
}

export class simulated_being_brain {
  constructor(init = {}) {
    this.braincode_register = init.braincode_register ?? [];
    this.brainprobe = init.brainprobe ?? [];
    this.brain_state = init.brain_state ?? [];
    this.script_overrides = init.script_overrides ?? 0;
    this.attention = init.attention ?? [];
  }
}

export class simulated_being {
  constructor(init = {}) {
    this.delta = init.delta ?? 0;
    this.constant = init.constant ?? 0;
    this.events = init.events ?? 0;
    this.braindata = init.braindata ?? 0;
    this.changes = init.changes ?? 0;
    this.immune_system = init.immune_system ?? 0;
  }
}

export class simulated_group {
  constructor(init = {}) {
    this.beings = init.beings ?? [];
    this.remains = init.remains ?? 0;
    this.num = init.num ?? 0;
    this.max = init.max ?? 0;
  }
}

export class simulated_timing {
  constructor(init = {}) {
    this.real_time = init.real_time ?? 0;
    this.last_time = init.last_time ?? 0;
    this.delta_cycles = init.delta_cycles ?? 0;
    this.count_cycles = init.count_cycles ?? 0;
    this.delta_frames = init.delta_frames ?? 0;
    this.count_frames = init.count_frames ?? 0;
  }
}
