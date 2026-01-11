// Auto-generated baseline port of entity.h
// NOTE: This maps many C macros/types to JS exports; it is not a full semantic port.

// Function-like macro dependency (defined in universe.h in the original codebase)
import { METRES_TO_APESPACE } from '../universe/universe.js';

export const SOCIAL_RESPECT_NORMAL = 127;
export const GESTATION_DAYS = 1;
export const SUCKLING_ENERGY = 2;
export const SUCKLING_MAX_SEPARATION = METRES_TO_APESPACE(2);
export const WEANING_DAYS = 14;
export const CARRYING_DAYS = 3;
export const CONCEPTION_INHIBITION_DAYS = 5;
export const VISIBILITY_MAXIMUM = (2000);
export const VISIBILITY_SPAN = VISIBILITY_MAXIMUM;

export class being_nearest {
  constructor(init = {}) {
    this.opposite_sex_distance = init.opposite_sex_distance ?? 0;
    this.same_sex_distance = init.same_sex_distance ?? 0;
  }
}

export class being_listen_struct {
  constructor(init = {}) {
    this.max_shout_volume = init.max_shout_volume ?? 0;
  }
}

export class drives_sociability_data {
  constructor(init = {}) {
    this.beings_in_vacinity = init.beings_in_vacinity ?? 0;
  }
}

export class being_remove_loop2_struct {
  constructor(init = {}) {
    this.selected_died = init.selected_died ?? 0;
    this.count = init.count ?? 0;
  }
}
