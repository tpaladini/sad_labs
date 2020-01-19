#!/bin/bash

# this script sends messages at full speed to every server
# writing to the same forum board the sequence 1,2,3 but sending
# "1" to the first server, "2" to the second and so on.
# if on every server we read the same sequence of messages on the id0 board, then
# the system is sequentially consistent.

i=0

while true
do
	((i++))
	echo $i
	node ../dmclient.js localhost:8000 "add public message" 1 mudito id0 > /dev/null
    node ../dmclient.js localhost:8001 "add public message" 2 mudito id0 > /dev/null
	node ../dmclient.js localhost:8002 "add public message" 3 mudito id0 > /dev/null
done


