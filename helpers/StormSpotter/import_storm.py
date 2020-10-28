from backend.parser import SSProcessor
import asyncio
import sys


sshandler = SSProcessor()
#sshandler.process(filename, filename, neo_user, neo_pass)
pro = sshandler.process(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
asyncio.run(pro)