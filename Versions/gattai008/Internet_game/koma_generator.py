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


all = itertools.combinations(koma, 2)
for x in all:
    print("\""+str(x[0])+str(x[1])+"\" : "+"[new "+str(x[0])+"(), "+"new "+str(x[1])+"()],")

all = itertools.combinations(koma, 2)
for x in all:
    print("case \""+str(x[0])+str(x[1])+"\" : \n"+"    made_koma = new "+str(x[0])+str(x[1])+"();\n"+"    break;")


for x in koma:
    print("\""+str(x)+str(x)+"\",")
"""
all = itertools.combinations(koma, 2)
double_koma = [("KN","KN"),
("GN","GN"),
("KY","KY"),
("KM","KM"),
("HS","HS"),
("KK","KK"),
("FU","FU")]

koma = list(all) + double_koma

for x in koma:
    print("case \""+str(x[0])+str(x[1])+"\" : \n"+"    made_koma = [new "+str(x[0])+"(), new "+str(x[1])+"()];\n"+"    break;")