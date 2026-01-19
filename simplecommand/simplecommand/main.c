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



int main(int argc, const char * argv[]) {
    // insert code here...
    printf("Hello, World!\n");
    return EXIT_SUCCESS;
}
