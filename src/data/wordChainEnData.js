/**
 * ⛓️ 끝말잇기 (영어 Word Chain) 단어 사전
 *
 * - 초등 영어 수준의 흔한 명사 위주 (3글자 이상, 소문자)
 * - 마지막 글자 → 첫 글자로 이어집니다.
 * - 여기 없는 단어는 정답 처리되지 않으므로 필요하면 추가해 주세요.
 */

export const EN_WORDS = [
  // a
  'apple', 'ant', 'animal', 'arm', 'art', 'answer', 'autumn', 'airplane',
  'airport', 'angel', 'ankle', 'apron', 'area', 'arrow', 'aunt', 'author',
  'avocado', 'age', 'air', 'alarm', 'album', 'alphabet', 'ambulance',
  'anchor', 'apartment', 'acorn', 'actor', 'address', 'adult', 'advice',
  // b
  'ball', 'banana', 'bear', 'bed', 'bell', 'bird', 'book', 'box', 'bread',
  'brother', 'bus', 'butter', 'button', 'baby', 'back', 'bag', 'bank',
  'base', 'basket', 'bat', 'bath', 'beach', 'bean', 'beard', 'bee', 'beef',
  'bicycle', 'blanket', 'blood', 'board', 'boat', 'body', 'bone', 'bottle',
  'bowl', 'brain', 'branch', 'brick', 'bridge', 'broom', 'brush', 'bubble',
  'bucket', 'bug', 'building', 'butterfly',
  // c
  'cat', 'car', 'cake', 'candy', 'cap', 'card', 'carrot', 'castle', 'chair',
  'cheese', 'cherry', 'chicken', 'child', 'circle', 'city', 'class', 'clock',
  'cloud', 'coat', 'coin', 'color', 'computer', 'cook', 'corn', 'country',
  'cousin', 'cow', 'crayon', 'cream', 'crown', 'cup', 'curtain', 'candle',
  'captain', 'carpet', 'cave', 'ceiling', 'chain', 'chalk', 'chest',
  'church', 'clay', 'cliff', 'coast', 'corner', 'crab', 'cricket',
  'crocodile',
  // d
  'dog', 'doll', 'door', 'duck', 'desk', 'dance', 'day', 'deer', 'dentist',
  'desert', 'diamond', 'dinner', 'dinosaur', 'dish', 'doctor', 'dolphin',
  'donkey', 'dragon', 'drawer', 'dream', 'dress', 'drink', 'drum', 'dust',
  'daughter', 'dad', 'dirt', 'dice',
  // e
  'ear', 'earth', 'egg', 'elbow', 'elephant', 'end', 'energy', 'engine',
  'eraser', 'evening', 'eye', 'eagle', 'east', 'edge', 'effort', 'elevator',
  'emotion', 'enemy', 'entrance', 'envelope', 'exam', 'example', 'exit',
  'eel',
  // f
  'face', 'family', 'farm', 'father', 'feather', 'fence', 'field', 'finger',
  'fire', 'fish', 'flag', 'floor', 'flower', 'food', 'foot', 'forest',
  'fork', 'fox', 'friend', 'frog', 'fruit', 'fun', 'future', 'fan', 'fall',
  'farmer', 'feeling', 'fever', 'film', 'fist', 'flame', 'flood', 'flour',
  'flute', 'fog', 'fountain', 'frame',
  // g
  'game', 'garden', 'gate', 'ghost', 'giant', 'gift', 'giraffe', 'girl',
  'glass', 'glove', 'goat', 'gold', 'goose', 'grape', 'grass', 'ground',
  'group', 'guitar', 'gum', 'gym', 'garage', 'garbage', 'gas', 'gentleman',
  'ginger', 'glue', 'goal', 'grade', 'grandmother', 'gravity', 'guard',
  'guest',
  // h
  'hair', 'hand', 'hat', 'head', 'heart', 'hen', 'hill', 'home', 'honey',
  'horse', 'hospital', 'house', 'hammer', 'hamster', 'harbor', 'hawk',
  'health', 'heat', 'heel', 'helicopter', 'helmet', 'hero', 'hint', 'hip',
  'history', 'hobby', 'hole', 'holiday', 'hood', 'hook', 'hope', 'horn',
  'hour', 'human', 'hunger', 'hunter', 'husband',
  // i
  'ice', 'idea', 'igloo', 'image', 'ink', 'insect', 'island', 'iron',
  'item', 'inch', 'injury', 'inside', 'interest', 'invention', 'invitation',
  'idol',
  // j
  'jam', 'jacket', 'jelly', 'jewel', 'job', 'juice', 'jungle', 'jar', 'jaw',
  'jeans', 'joke', 'journey', 'joy', 'judge',
  // k
  'kangaroo', 'key', 'king', 'kitchen', 'kite', 'kitten', 'knee', 'knife',
  'knight', 'knot', 'koala', 'kid', 'kindness', 'kiwi', 'kettle',
  'keyboard', 'kingdom',
  // l
  'ladder', 'lake', 'lamp', 'land', 'leaf', 'leg', 'lemon', 'letter',
  'library', 'light', 'lion', 'lip', 'list', 'lizard', 'log', 'love',
  'lunch', 'lady', 'ladybug', 'lane', 'language', 'lap', 'lawn', 'lawyer',
  'leader', 'leather', 'lesson', 'level', 'life', 'lightning', 'lily',
  'line', 'luck', 'luggage',
  // m
  'machine', 'magazine', 'magic', 'mail', 'man', 'map', 'market', 'mask',
  'mat', 'meal', 'meat', 'medal', 'medicine', 'melon', 'memory', 'menu',
  'mermaid', 'message', 'metal', 'milk', 'mind', 'mirror', 'mom', 'money',
  'monkey', 'monster', 'month', 'moon', 'morning', 'mosquito', 'mother',
  'mountain', 'mouse', 'mouth', 'movie', 'mud', 'museum', 'mushroom',
  'music', 'mango', 'marble', 'master', 'math', 'mayor', 'member',
  'middle', 'mile', 'minute', 'model', 'moment', 'monitor', 'mop', 'moth',
  'motor',
  // n
  'name', 'nail', 'nap', 'nature', 'neck', 'needle', 'neighbor', 'nest',
  'net', 'news', 'night', 'noise', 'noodle', 'north', 'nose', 'note',
  'notebook', 'number', 'nurse', 'nut', 'napkin', 'nation', 'navy',
  'necklace', 'nephew', 'nickname', 'niece', 'noon',
  // o
  'ocean', 'office', 'oil', 'onion', 'orange', 'ostrich', 'oven', 'owl',
  'object', 'octopus', 'opinion', 'order', 'organ', 'outside', 'owner',
  'oyster', 'oak', 'olive', 'opera', 'orchestra',
  // p
  'page', 'paint', 'pan', 'panda', 'paper', 'parent', 'park', 'parrot',
  'party', 'pasta', 'path', 'peace', 'peach', 'peanut', 'pear', 'pen',
  'pencil', 'penguin', 'people', 'pepper', 'person', 'pet', 'photo',
  'piano', 'picnic', 'picture', 'pie', 'pig', 'pillow', 'pilot', 'pin',
  'pine', 'pineapple', 'pink', 'pipe', 'pizza', 'place', 'plan', 'plane',
  'planet', 'plant', 'plate', 'player', 'playground', 'pocket', 'poem',
  'point', 'police', 'pond', 'pony', 'pool', 'popcorn', 'post', 'pot',
  'potato', 'powder', 'power', 'present', 'president', 'price', 'prince',
  'princess', 'prize', 'problem', 'project', 'pumpkin', 'puppy', 'purse',
  'puzzle',
  // q
  'queen', 'question', 'quiz', 'quilt', 'quarter',
  // r
  'rabbit', 'race', 'radio', 'rain', 'rainbow', 'rat', 'reason', 'recipe',
  'record', 'rectangle', 'refrigerator', 'reindeer', 'report', 'rest',
  'restaurant', 'ribbon', 'rice', 'ring', 'river', 'road', 'robot', 'rock',
  'rocket', 'roof', 'room', 'root', 'rope', 'rose', 'ruler', 'runner',
  'rule', 'rhythm',
  // s
  'salt', 'sand', 'sandwich', 'school', 'science', 'scissors', 'sea',
  'season', 'seat', 'secret', 'seed', 'sentence', 'shadow', 'shape',
  'shark', 'sheep', 'shell', 'ship', 'shirt', 'shoe', 'shop', 'shoulder',
  'shower', 'sign', 'silver', 'singer', 'sister', 'size', 'skate', 'ski',
  'skin', 'skirt', 'sky', 'sled', 'smile', 'snack', 'snail', 'snake',
  'snow', 'soap', 'soccer', 'sock', 'sofa', 'soldier', 'son', 'song',
  'sound', 'soup', 'south', 'space', 'spider', 'spinach', 'spoon', 'sport',
  'spring', 'square', 'squirrel', 'stadium', 'stage', 'stair', 'stamp',
  'star', 'station', 'steam', 'stick', 'stomach', 'stone', 'store',
  'storm', 'story', 'stove', 'strawberry', 'street', 'student', 'subway',
  'sugar', 'summer', 'sun', 'sunflower', 'swan', 'sweater', 'swing',
  'sword', 'subject', 'success',
  // t
  'table', 'tail', 'talent', 'tape', 'taste', 'taxi', 'tea', 'teacher',
  'team', 'tear', 'telephone', 'television', 'temple', 'tent', 'test',
  'text', 'theater', 'thumb', 'ticket', 'tiger', 'time', 'tire', 'title',
  'toast', 'today', 'toe', 'tomato', 'tongue', 'tool', 'tooth', 'top',
  'towel', 'tower', 'town', 'toy', 'track', 'train', 'treasure', 'tree',
  'triangle', 'trip', 'truck', 'trumpet', 'truth', 'tulip', 'tunnel',
  'turkey', 'turtle', 'twin', 'tray', 'trash',
  // u
  'umbrella', 'uncle', 'uniform', 'universe', 'unicorn', 'unit',
  // v
  'vacation', 'valley', 'van', 'vase', 'vegetable', 'vest', 'victory',
  'video', 'village', 'violin', 'visitor', 'voice', 'volcano',
  'volleyball', 'vet', 'vine', 'vitamin', 'vowel',
  // w
  'wagon', 'waist', 'wall', 'wallet', 'watch', 'water', 'watermelon',
  'wave', 'weather', 'web', 'week', 'weekend', 'west', 'whale', 'wheat',
  'wheel', 'whistle', 'wind', 'window', 'wing', 'winner', 'winter', 'wish',
  'witch', 'wizard', 'wolf', 'woman', 'wood', 'word', 'work', 'world',
  'worm', 'wrist', 'writer',
  // x
  'xylophone',
  // y
  'yard', 'year', 'yellow', 'yogurt', 'yolk', 'youth', 'yoga', 'yacht',
  // z
  'zebra', 'zoo', 'zipper', 'zero', 'zone', 'zigzag',
]
