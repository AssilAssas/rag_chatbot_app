def load_faq(filepath: str):
    faqs = []
    with open(filepath, encoding='utf-8') as f:
        lines = f.read().split('\n')
    question, answer = None, None
    for line in lines:
        if line.startswith('Q:'):
            question = line[2:].strip()
        elif line.startswith('A:'):
            answer = line[2:].strip()
            if question and answer:
                faqs.append({'question': question, 'answer': answer})
                question, answer = None, None
    return faqs 