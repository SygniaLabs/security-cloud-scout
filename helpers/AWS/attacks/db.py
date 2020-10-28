
from neo4j import GraphDatabase, exceptions

class Neo4j(object):
    
    driver = None
    def __init__(self,
                 host="localhost",
                 port="7687",
                 username="neo4j",
                 password="",
                 console=None):

        self.uri = f"bolt://{host}:{port}"
        self.username = username
        self.password = password


    def close(self):
        if self.driver is not None:
            self.driver.close()
            
    def open(self):

        self.driver = GraphDatabase.driver(
            self.uri,
            auth=(self.username, self.password)
        )

    def available(self):
        try:
            self.open()
        except Exception:
            return False
        return True

    def run(self, cypher):

        if not self.available():
            raise Exception("No DB")

        try:
            with self.driver.session() as session:
                results = session.run(cypher)
            return results

        except exceptions.CypherSyntaxError as e:
            print(str(e))