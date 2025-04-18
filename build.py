from os import walk
from os.path import join, dirname, abspath, getsize
from zipfile import ZipFile, ZIP_DEFLATED

def unexpand(path):
  return path.replace('/data/data/com.termux/files/home', '~')

def short(path):
  return path.replace('/data/data/com.termux/files/home/mywebview/pages/mywebview/', '')

def fmt_size(bytes):
  if bytes < 1024 ** 1:
    return f'{bytes} B'
  if bytes < 1024 ** 2:
    return f'{round(bytes / 1024 ** 1, 2)} KB'
  if bytes < 1024 ** 3:
    return f'{round(bytes / 1024 ** 2, 2)} MB'
  #if bytes < 1024 ** 4:
  return f'{round(bytes / 1024 ** 3, 2)} GB'

totalSize = 0
with ZipFile('.dist/bundles.zip', 'w', ZIP_DEFLATED) as zip:
  for root, _, files in walk(abspath('.')):
    for file in files:
      path = join(root, file)
      if not path.startswith(abspath('.git')) and not path.startswith(abspath('.dist')):
        size = getsize(path)
        totalSize += size
        
        print(f'{short(path)}: {fmt_size(size)}')
        zip.write(path)
zippedSize = getsize(abspath('.dist/bundles.zip'))
print(f'Compressing {fmt_size(totalSize)} -> {fmt_size(zippedSize)}')
print(f'Wrote file: .dist/bundles.zip')
