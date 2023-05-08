koma = ["KN", "GN", "KY", "KM", "HS", "KK", "FU"]

import itertools

"""
all = itertools.combinations(koma, 2)

for x in all:
    print(str(list(x)),":","\""+str(x[0])+str(x[1])+"\",")

all = itertools.combinations(koma, 2)
for x in all:
    print("\""+str(x[0])+str(x[1])+"\"",": new",str(x[0])+str(x[1])+"(),")

all = itertools.combinations(koma, 2)
for x in all:
    print("class", str(x[0])+str(x[1]), "extends Koma {")
    print("}")

"""
all = itertools.combinations(koma, 2)
for x in all:
    print("\""+str(x[0])+str(x[1])+"\" : "+"[new "+str(x[0])+"(), "+"new "+str(x[1])+"()],")
    