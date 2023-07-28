import random 
import collections
from multiprocessing import Pool

d20 = lambda : random.randint(1,20)
d6 = lambda: random.randint(1,6)

d4 = lambda: random.randint(1,4)

AC = 1

N = 100000000


def calc_d6(adv=None):
    dice_sum = 0
    rs = [d20(), d20()]

    if adv == "disadv":
        r = min(rs)
    elif adv == "adv":
        r = max(rs)
    else:
        r = rs[0]

    buff = d4()

    if r >= 20:
        return d6() + d6() 
    elif r == 1:
        return 0
    elif r + buff >= AC:
        return d6()
    else:
        return 0

def calc_d20(adv):
    rs = [d20(), d20()]
    if adv == "disadv":
        r = min(rs)
    elif adv == "adv":
        r = max(rs)
    else:
        r = rs[0]

    if r == 20:
        return "crit"
    elif r==1:
        return "crit miss"
    elif r >= AC:
        return "hit"
    else:
        return "miss"
    return dice_sum


def run(*args):
    s = 0
    # s  = calc_d20("adv")
    s += calc_d6("")
    s += calc_d6("")

    return s

if __name__ == '__main__':
    with Pool(24) as p:
        results = p.map(run, range(N))
        res = {k:v/(N) for k,v in sorted(collections.Counter(results).items())}
        print(res)
        for k,v in res.items():
            print(k, v)
        print(sum([k*v for k,v in res.items()]))