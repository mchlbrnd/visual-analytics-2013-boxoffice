#!/usr/bin/env python

import csv, HTMLParser, json
from time import strftime, strptime
from nltk.tokenize import wordpunct_tokenize as tokenize
from nltk.stem.snowball import EnglishStemmer

def rewriteFile(infile, outfile):
    totals = {'positive_terms': 0, 'negative_terms': 0}
    with open(infile, 'rb') as csvfile:
        reader = csv.reader(csvfile)

        # check if tweets are in column 301
        colheaders = reader.next()
        if colheaders[301] != 'text':
            print 'COLUMNS HAVE CHANGED\n'
        
        hourly_sums = []
        last_hour = ''
        hoursum = {}

        # sum the pos/neg terms per hour
        for row in reader:
            created_at = row[5]
            tweet = row[301]
            if len(created_at) == 0: continue
            datetime = strptime(created_at, '%Y-%m-%d %H:%M:%S+00:00')
            datestring = strftime('%Y-%m-%d %Hh', datetime)
            
            pos_count, neg_count, pos_terms, neg_terms = computeSentiment(tweet)
            totals['positive_terms'] += pos_count
            totals['negative_terms'] += neg_count

            if datestring == last_hour:
                hoursum['pos_count'] += pos_count
                hoursum['neg_count'] += neg_count
                hoursum['pos_terms'] = hoursum['pos_terms'] | pos_terms
                hoursum['neg_terms'] = hoursum['neg_terms'] | neg_terms
            else:
                if not last_hour == '':
                    hoursum['pos_terms'] = sorted(list(hoursum['pos_terms']))
                    hoursum['neg_terms'] = sorted(list(hoursum['neg_terms']))
                    hourly_sums.append(hoursum.copy())
                hoursum['hour'] = datestring
                hoursum['pos_count'] = pos_count
                hoursum['neg_count'] = neg_count
                hoursum['pos_terms'] = pos_terms
                hoursum['neg_terms'] = neg_terms
            last_hour = datestring

    ofile = open(outfile, "wb")
    json.dump(hourly_sums, ofile, sort_keys=True, indent=4, separators=(',', ': '))
    ofile.close()
    return totals

def computeSentiment(tweet_text):
    pos_count = 0
    neg_count = 0
    pos_terms = []
    neg_terms = []
    st = EnglishStemmer()

    tokenized_tweet = tokenize(tweet_text)
    for t in tokenized_tweet:
        #print st.stem(t.lower())
        if st.stem(t.lower()) in negative_terms:
            neg_terms.append(t.lower())
            neg_count += 1
        elif st.stem(t.lower()) in positive_terms:
            pos_terms.append(t.lower())
            pos_count += 1

    return pos_count, neg_count, set(pos_terms), set(neg_terms)

positive_terms = {'dream', 'final', 'brain', 'saw', 'mind', 'oscar', 'ver',
                  'amaz', 'confus', 'film', 'today', 'perfect', 'time',
                  'stori', 'understand', 'play', 'awesom', 'fuck', 'danc',
                  'year', 'social', 'idea', 'tomorrow', 'tonight', 'won',
                  'sleep', 'cinema', 'black', 'beauti', 'wow', 'seen', 'avail',
                  'stori', 'win', 'king', 'director', 'pictur', 'best', 'cri',
                  'deserv', 'end', 'greatest', 'perform', 'excel', 'year',
                  'expect', 'dark', 'brilliant', 'moment', 'action', 'scene',
                  'wasn', 'bit', 'masterpiece', 'video'}

negative_terms = {'dog', 'funni', 'cat', 'suck', 'twilight', 'watchin',
                  'stupid', 'hilari', 'lol', 'cute', 'vs', 'lmfao', 'blood',
                  'worst', 'hoe', 'famili', 'netflix', 'team', 'spoof',
                  'coupl', 'finish', 'wed', 'bout', 'terribl', 'smh', 'sit',
                  'bad', 'talk', 'hate', 'horribl', 'white', 'racist', 'funni',
                  'song', 'look', 'wait', 'onlin', 'american', 'cute', 'joke',
                  'laugh', 'word', 'humor', 'watcheru', 'team', 'problem',
                  'crap', 'shit', 'peopl', 'dont', 'worst'}

if __name__ == '__main__':

    infile = "sanatized.csv"
    outfile = "hourly_sums.json"

    totals = rewriteFile(infile, outfile)
    print totals
