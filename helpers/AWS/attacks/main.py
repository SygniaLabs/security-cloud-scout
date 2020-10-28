import sys
from attacks import Attacks

def handle_attacks(credentials):
    """
    awspx attacks
    """

    include_conditional_attacks = False
    skip_attacks = []
    only_attacks = []

    max_attack_iterations = 5
    max_attack_depth = None

    attacks = Attacks(skip_conditional_actions=include_conditional_attacks == False,
                      skip_attacks=skip_attacks, only_attacks=only_attacks, credentials=credentials)

    attacks.compute(max_iterations=max_attack_iterations,
                    max_search_depth=str(max_attack_depth
                                         if max_attack_depth is not None
                                         else ""))

creds = {'username': sys.argv[1], 'password': sys.argv[2]}
handle_attacks(creds)