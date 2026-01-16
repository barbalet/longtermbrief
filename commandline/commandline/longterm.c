
/****************************************************************

    longterm.c

    =============================================================

 Copyright 1996-2025 Tom Barbalet. All rights reserved.

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or
    sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.

****************************************************************/

#define _CRT_SECURE_NO_WARNINGS

#define CONSOLE_ONLY /* Please maintain this define until after ALIFE XIII July 22nd */
#define CONSOLE_REQUIRED

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>

#ifndef _WIN32
#include <pthread.h>
#include <unistd.h>
#include <signal.h>
#include <sys/time.h>
#endif

#include "toolkit.h"
#include "sim.h"
#include "universe.h"


n_string_block simulation_filename;


n_int draw_error( n_constant_string error_text, n_constant_string location, n_int line_number )
{
    printf( "ERROR: %s @ %s %ld\n", ( const n_string ) error_text, location, line_number );
    return -1;
}

int command_line_run( void )
{
    sprintf( simulation_filename, "%s", "realtime.txt" );

    srand( ( unsigned int ) time( NULL ) );
    sim_console( simulation_filename, rand() );

    return ( 1 );
}

#ifndef _WIN32

static int make_periodic( unsigned int period, sigset_t *alarm_sig )
{
    int ret;
    struct itimerval value;

    /* Block SIGALRM in this thread */
    sigemptyset( alarm_sig );
    sigaddset( alarm_sig, SIGALRM );
    pthread_sigmask( SIG_BLOCK, alarm_sig, NULL );

    /* Set the timer to go off after the first period and then
     repetitively */
    value.it_value.tv_sec = period / 1000000;
    value.it_value.tv_usec = period % 1000000;
    value.it_interval.tv_sec = period / 1000000;
    value.it_interval.tv_usec = period % 1000000;
    ret = setitimer( ITIMER_REAL, &value, NULL );
    if ( ret != 0 )
    {
        perror( "Failed to set timer" );
    }
    return ret;
}

static void wait_period( sigset_t *alarm_sig )
{
    int sig;
    /* Wait for the next SIGALRM */
    sigwait( alarm_sig, &sig );
}

#define TIMING_CONST_MS 100

static n_uint count = 0;

static void *periodic_thread( void *arg )
{
    sigset_t alarm_sig;
    simulated_group *group;
    make_periodic( 1000 * TIMING_CONST_MS, &alarm_sig );
    while ( 1 )
    {
        group = sim_group();
        sim_cycle();
        count++;
        if ( ( count & 2047 ) == 0 )
        {
            printf( "count is %ld\n", count );
        }
        if ( group->num == 0 )
        {
            printf( "new run at %ld\n", count );

            sim_init( 1, rand(), MAP_AREA, 0 );
        }

        wait_period( &alarm_sig );
    }
    return NULL;
}

#endif

#if 1

n_string_block fake_input_string;
n_int          fake_input_string_present;

n_string fake_input( n_string value, n_int length ) {
//    fgets( value, STRING_BLOCK_SIZE, stdin );
    if (fake_input_string_present) {
        memory_copy((n_byte *)fake_input_string, (n_byte *)value, length);
        fake_input_string_present = 2;
    }
    return value;
}

void fake_output( n_constant_string value ) {
    printf("%s\n", value);
}

void lib_init(void) {
    sim_set_console_input( &fake_input);
    sim_set_console_output( &fake_output );
    
    srand( ( unsigned int ) time( NULL ) );

    printf( "\n *** %sConsole, %s ***\n", SHORT_VERSION_NAME, FULL_DATE );
    printf( "      For a list of commands type 'help'\n\n" );

    io_command_line_execution_set();
    sim_init( KIND_START_UP, rand(), MAP_AREA, 0 );
}

void lib_close(void) {
    sim_close();
}

int lib_quit_check(void) {
    return (sim_thread_console_quit() == 0);
}

void lib_check_string(char * incoming) {
    memory_erase((n_byte*)fake_input_string, STRING_BLOCK_SIZE);
    memory_copy((n_byte *)incoming, (n_byte *)fake_input_string, strlen(incoming));
    fake_input_string_present = 1;
    sim_thread_console();
    if (fake_input_string_present == 2) {
        printf("Erase!\n");
        memory_erase((n_byte*)fake_input_string, STRING_BLOCK_SIZE);
        fake_input_string_present = 0;
    }
}

#ifndef MAIN_LIBRARY

int main( int argc, n_string argv[] )
{
    lib_init();
    
    while ( lib_quit_check() )
    {
        n_string_block example = {0};
        fgets( example, STRING_BLOCK_SIZE, stdin );
        lib_check_string(example);
    }
    
    lib_close();

    return 1;
}

#endif

#else

int main( int argc, n_string argv[] )
{
    return command_line_run();
}

#endif

