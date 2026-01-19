//
//  main.c
//  simplecommand
//
//  Created by Thomas Barbalet on 1/18/26.
//

#include <stdlib.h>
#include <stdio.h>

#include "toolkit.h"

const static simulated_console_command control_commands[] =
{
    {&console_help,               "help",           "[(command)]",          "Displays a list of all the commands"},
    
    {&console_quit,           "quit",           "",                     "Quits the console"},
    {&console_quit,           "exit",           "",                     ""},
    {&console_quit,           "close",          "",                     ""},

    {0L, 0L},
};

n_int draw_error( n_constant_string error_text, n_constant_string location, n_int line_number )
{
    printf( "ERROR: %s @ %s %ld\n", ( const n_string ) error_text, location, line_number );
    return -1;
}

int main(int argc, const char * argv[]) {
    
    
    {
        do
        {}
        while ( console_cycle( 0L,
                            ( simulated_console_command * )control_commands,
                            console_entry,
                            console_out ) == 0 );
    }
    
    return EXIT_SUCCESS;
}
