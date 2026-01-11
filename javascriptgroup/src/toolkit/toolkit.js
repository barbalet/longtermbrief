// Auto-generated baseline port of toolkit.h
// NOTE: This maps many C macros/types to JS exports; it is not a full semantic port.

export const CHAR_SPACE = (32);
export const PACKED_DATA_BLOCK = (32*32*32*2);
export const TWO_PI = ((6.2831853071795864769252867665590057683943));
export const SINE_MAXIMUM = (26880);
export const BIG_INTEGER = (2147483647);
export const BIG_NEGATIVE_INTEGER = (0-2147483648);
export const NOTHING = (0);
export const STRING_BLOCK_SIZE = (4096);
export const FILE_COPYRIGHT = 0x00;
export const FILE_EOF = 0x0100;
export const FILE_OKAY = 0x0000;
export const FILE_ERROR = (-1);
export const NEW_SD_MULTIPLE = 26880;
export const SHOW_SUCCESS = (1);
export const SHOW_NO_OP = (0);
export const SHOW_FAILURE = (-1);
export const SIZEOF_NUMBER_WRITE = (sizeof);
export const AUDIO_FFT_MAX_BITS = (15);
export const AUDIO_FFT_MAX_BUFFER = (1<<AUDIO_FFT_MAX_BITS);

export class n_quad {
  constructor(init = {}) {
    this.four = init.four ?? [];
  }
}

export class n_line {
  constructor(init = {}) {
    this.two = init.two ?? [];
  }
}

export class n_rgba {
  constructor(init = {}) {
    this.a = init.a ?? 0;
    this.r = init.r ?? 0;
    this.g = init.g ?? 0;
    this.b = init.b ?? 0;
  }
}

export class n_points {
  constructor(init = {}) {
    this.no_of_points = init.no_of_points ?? 0;
    this.max_points = init.max_points ?? 0;
  }
}

export class n_spacetime {
  constructor(init = {}) {
    this.date = init.date ?? 0;
    this.location = init.location ?? [];
    this.time = init.time ?? 0;
  }
}

export class simulated_file_entry {
  constructor(init = {}) {
    this.characters = init.characters ?? [];
    this.incl_kind = init.incl_kind ?? 0;
    this.number_entries = init.number_entries ?? 0;
    this.start_location = init.start_location ?? 0;
  }
}

export class memory_list {
  constructor(init = {}) {
    this.count = init.count ?? 0;
    this.max = init.max ?? 0;
    this.unit_size = init.unit_size ?? 0;
  }
}

export class number_array {
  constructor(init = {}) {
    this.number = init.number ?? 0;
    this.array = init.array ?? 0;
  }
}

export class n_join {
  constructor(init = {}) {
  }
}

export class n_background8 {
  constructor(init = {}) {
  }
}

export class n_color8 {
  constructor(init = {}) {
    this.color = init.color ?? 0;
  }
}

export class n_file {
  constructor(init = {}) {
    this.size = init.size ?? 0;
    this.location = init.location ?? 0;
  }
}

export class n_file_chain {
  constructor(init = {}) {
    this.expected_bytes = init.expected_bytes ?? 0;
    this.hash = init.hash ?? 0;
  }
}

export class n_array {
  constructor(init = {}) {
    this.data = init.data ?? 0;
    this.type = init.type ?? 0;
  }
}

export class n_object {
  constructor(init = {}) {
    this.primitive = init.primitive ?? 0;
    this.name = init.name ?? 0;
    this.name_hash = init.name_hash ?? 0;
  }
}

export class simulated_console_command {
  constructor(init = {}) {
    this.command = init.command ?? 0;
    this.addition = init.addition ?? 0;
    this.help_information = init.help_information ?? 0;
  }
}
