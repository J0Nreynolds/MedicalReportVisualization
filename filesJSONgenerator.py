import os
import errno

# Script for mapping a dictionary of BodyParts3D keys to their .obj files
# Change directory as needed
def json_creator(path):

    dictionary = dict((os.path.basename((os.path.join(path, contents)))[0:-4], os.path.join(path, contents)) for contents in os.listdir(path))
    return dictionary

if __name__ == '__main__':
    import json
    import sys
    directory = "./decimation/output/"

    print(json.dumps(json_creator(directory), indent=2, sort_keys=True))
