// Auto-generated baseline port of sim.h
// NOTE: This maps many C macros/types to JS exports; it is not a full semantic port.

export const FIXED_RANDOM_SIM = 0x5261f726;
export const SHORT_VERSION_NAME = "Simulated Ape 0.708 ";
export const FULL_DATE = (process.env.BUILD_DATE ?? new Date().toDateString());
export const VERSION_NUMBER = 708;
export const COPYRIGHT_DATE = "Copyright 1996 - 2025 ";
export const FULL_VERSION_COPYRIGHT = "Copyright Tom Barbalet, 1996-2025.";
export const SIMULATED_APE_SIGNATURE = (('N'<< 8) | 'A');
export const SIMULATED_WAR_SIGNATURE = (('N'<< 8) | 'W');
export const COPYRIGHT_NAME = "Tom Barbalet. ";
export const COPYRIGHT_FOLLOW = "All rights reserved.";
export const NUM_TERRAIN = 0; // placeholder (original C sets WINDOW_PROCESSING to NUM_TERRAIN on iOS)
export const NUM_CONTROL = 1;  // placeholder (non-iOS default)
export const WINDOW_PROCESSING = (process.env.TARGET_OS_IOS ? NUM_TERRAIN : NUM_CONTROL);
export const DRAW_WINDOW_VIEW = (1);
export const DRAW_WINDOW_TERRAIN = (2);
export const DRAW_WINDOW_CONTROL = (4);
export const BRAINCODE_SIZE = 128;
export const BRAINCODE_PROBES = (BRAINCODE_SIZE>>3);
export const BRAINCODE_PSPACE_REGISTERS = 3;
export const BRAINCODE_MAX_FREQUENCY = 16;
export const BRAINCODE_BYTES_PER_INSTRUCTION = 3;
export const BRAINCODE_BLOCK_COPY = 16;
export const BRAINCODE_MAX_ADDRESS = (BRAINCODE_SIZE*2);
export const NON_INTERPOLATED = COLOR_WHITE;
export const MAP_BITS = (process.env.TARGET_OS_IOS ? 8 : 9);
export const MAP_TILES = (process.env.TARGET_OS_IOS ? 6 : 1);
export const MAP_DIMENSION = (1<<MAP_BITS);
export const MAP_AREA = (1<<(2*MAP_BITS));
export const APE_TO_MAP_BIT_RATIO = (6);
export const MAP_TO_TERRITORY_RATIO = (5);
export const TERRITORY_DIMENSION = MAPSPACE_TO_TERRITORY;
export const TERRITORY_AREA = (TERRITORY_DIMENSION*TERRITORY_DIMENSION);
export const HI_RES_MAP_BITS = (MAP_BITS+3);
export const HI_RES_MAP_DIMENSION = (1<<HI_RES_MAP_BITS);
export const HI_RES_MAP_AREA = (1<<(2*HI_RES_MAP_BITS));
export const MAP_APE_RESOLUTION_SIZE = (MAPSPACE_TO_APESPACE);
export const APESPACE_BOUNDS = (-1);
export const LAND_TILE_EDGE = (256);
export const NUMBER_LAND_TILES = (MAP_DIMENSION/LAND_TILE_EDGE);
export const OFFSCREENSIZE = (MAP_AREA + TERRAIN_WINDOW_AREA + CONTROL_WINDOW_AREA);
export const WEATHER_CLOUD = (32768>>4);
export const WEATHER_RAIN = (WEATHER_CLOUD * 3);
export const TIME_HOUR_MINUTES = (60);
export const TIME_DAY_MINUTES = (TIME_HOUR_MINUTES * 24);
export const TIME_MONTH_MINUTES = (TIME_DAY_MINUTES * 28);
export const TIME_YEAR_MINUTES = (TIME_MONTH_MINUTES * 13);
export const TIME_YEAR_DAYS = (7 * 52);
export const TIME_CENTURY_DAYS = (TIME_YEAR_DAYS * 100);
export const LUNAR_ORBIT_MINS = 39312;
export const WATER_MAP = 128;
export const TIDE_AMPLITUDE_LUNAR = 8;
export const TIDE_AMPLITUDE_SOLAR = 2;
export const TIDE_MAX = (WATER_MAP + TIDE_AMPLITUDE_LUNAR + TIDE_AMPLITUDE_SOLAR);
export const NIGHT_END_POINT = (256);
export const DAWN_END_POINT = (384);
export const DAY_END_POINT = (1152);
export const DUSK_END_POINT = (1184);
export const MAX_MODIFIED_TIME = (238);

export class n_version {
  constructor(init = {}) {
    this.signature = init.signature ?? 0;
    this.version = init.version ?? 0;
  }
}

export class n_tile {
  constructor(init = {}) {
    this.genetics = init.genetics ?? [];
    this.delta_pressure = init.delta_pressure ?? [];
    this.delta_pressure_highest = init.delta_pressure_highest ?? 0;
    this.delta_pressure_lowest = init.delta_pressure_lowest ?? 0;
    this.atmosphere_highest = init.atmosphere_highest ?? 0;
    this.atmosphere_lowest = init.atmosphere_lowest ?? 0;
    this.local_delta = init.local_delta ?? 0;
  }
}

export class n_land {
  constructor(init = {}) {
    this.tiles = init.tiles ?? [];
    this.tiles = init.tiles ?? [];
    this.genetics = init.genetics ?? [];
    this.wind_value_x = init.wind_value_x ?? 0;
    this.wind_value_y = init.wind_value_y ?? 0;
    this.wind_aim_x = init.wind_aim_x ?? 0;
    this.wind_aim_y = init.wind_aim_y ?? 0;
    this.wind_dissipation = init.wind_dissipation ?? 0;
    this.date = init.date ?? 0;
    this.time = init.time ?? 0;
    this.tide_level = init.tide_level ?? 0;
    this.topography_highdef = init.topography_highdef ?? [];
    this.highres_tide = init.highres_tide ?? [];
  }
}

export class n_tile_coordinates {
  constructor(init = {}) {
    this.tile = init.tile ?? 0;
    this.facing = init.facing ?? 0;
  }
}