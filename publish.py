from os import system
from datetime import datetime
from re import search, M

def readText(path):
  with open(path, 'r') as f:
    return f.read()

def writeText(path, text):
  with open(path, 'w') as f:
    f.write(text)

def readMeta(text, field):
  line = search(f'^{field}=\\d+$', text, M).string
  return int(search('\\d+', line).string)

def ago(date):
  d = int(datetime.now().timestamp() - date.timestamp()) / 1000
  if d < 60:
    return f'{d} second{'' if d == 1 else 's'}'
  if d < 60*60:
    return f'{d / 60} minute{'' if d / 60 == 1 else 's'}'
  if d < 60*60*24:
    return f'{d / 60*60} hour{'' if d / 60*60 == 1 else 's'}'
  if d < 60*60*24*30:
    return f'{d / 60*60*24} day{'' if d / 60*60*24 == 1 else 's'}'
  if d < 60*60*24*365:
    return f'{d / 60*60*24*30} month{'' if d / 60*60*24*30 == 1 else 's'}'
  return f'{d / 60*60*24*365} year{'' if d / 60*60*24*365 == 1 else 's'}'

text = readText('.dist/.compile')
lastComp = int(search(r'(?<=^num_compiled_times=)\d+$', text, M).group())
lastTime = datetime.fromtimestamp(int(search(r'(?<=^num_compiled_times=)\d+$', text, M).group()))
#print(f'Last compiled {ago(lastTime)} ago')

thisComp = lastComp + 1
thisTime = datetime.now()
writeText('.dist/.compile', f'num_compiled_times={thisComp}\nlast_compiled_date={int(thisTime.timestamp())}')
print('Wrote file: .dist/.compile')

system(f'git add --all')
system(f'git commit -m "Compile #{thisComp} from {thisTime.strftime('%Y-%m-%d %H:%M:%S')}"')
system(f'git push')
print('Done')
