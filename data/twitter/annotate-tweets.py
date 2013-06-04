#!/usr/bin/env python

import csv, HTMLParser
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
        # add columns for annotated, positive, negative
        colheaders.append('annotated_text')
        colheaders.append('positive_count')
        colheaders.append('negative_count')

        ofile = open(outfile, "wb")
        writer = csv.writer(ofile)
        writer.writerow(colheaders)

        # open a file to save tweets
        filename = "tweets.txt"
        tweetstxt = open(filename, 'w')

        # get the term counts for each tweet
        for row in reader:
            tweet = row[301]
            ann, pos, neg = computeSentiment(tweet)
            totals['positive_terms'] += pos
            totals['negative_terms'] += neg

            if not pos == 0 and neg == 0: # 
                print ann

            # add result to row
            exp_row = row + [ann, pos, neg]
            writer.writerow(exp_row)

            # write tweet text to file
            if len(tweet) > 10:
                # unescape html entities
                tweet = HTMLParser.HTMLParser().unescape(tweet)
                tweetstxt.write(tweet + "\n\n")
    tweetstxt.close()
    ofile.close()
    return totals

def computeSentiment(tweet_text):
    annotated = ''
    positive = 0
    negative = 0
    st = EnglishStemmer()

    tokenized_tweet = tokenize(tweet_text)
    for t in tokenized_tweet:
        #print st.stem(t.lower())
        wsp = ' '
        if len(annotated) == 0 or annotated[-1] in '@#':
            wsp = ''
        if st.stem(t.lower()) in negative_terms:
            annotated += wsp+'<span class="negative">'+t+'</span>' 
            negative += 1
        elif st.stem(t.lower()) in positive_terms:
            annotated += wsp+'<span class="positive">'+t+'</span>'
            positive += 1
        else:
            if len(t) == 1 and t not in '@#':
                annotated += t
            else: annotated += wsp + t

    return annotated, positive, negative

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
    outfile = "expanded.csv"

    totals = rewriteFile(infile, outfile)
    print totals
##    testpos = ' '.join(positive_terms)
##    ann, pos, neg = computeSentiment(testpos)
##    print ann
##    testneg = ' '.join(negative_terms)
##    ann, pos, neg = computeSentiment(testneg)
##    print ann
