#!/usr/bin/python3
import os
import json

sequences = []

for i in range(0,3):
    print(f"getting messages from localhost:800{i}")
    # get public message list from every server
    stream = os.popen(f'node ../dmclient.js localhost:800{i} "get public message list" id0')
    
    # get actual output
    output = stream.read()
    output = output.split("get public message list:1")
    output = output[1]
    
    # read json message list
    data = json.loads(output)
    sequences.append([x["msg"] for x in data])

min_length = min([len(x) for x in sequences])
sequences = [x[:min_length] for x in sequences]

print(f"analyzed {min_length} messages.")

if sequences[0] == sequences[1] == sequences[2]:
    print("the system respects sequential consistency")
else:
    print("the system is not sequentially consistent")

for i in range(0, min_length):
    if not(sequences[0][i] == sequences[1][i] == sequences[2][i]):
        print(f"{i}: {sequences[0][i]}\t\t\t|{sequences[1][i]}\t\t\t|{sequences[2][i]}") 
