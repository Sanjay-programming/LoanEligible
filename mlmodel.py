import sys
import pandas as pd
import pickle


def main():
    model = pickle.load(open('./model/model.pkl', 'rb'))
    column= ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed',
       'ApplicantIncome', 'CoapplicantIncome', 'LoanAmount',
       'Loan_Amount_Term', 'Credit_History', 'Property_Area']
    features= pd.Index(column)
    li=[]
    # Retrieve the input values from command-line arguments
    li=sys.argv
    li= li[2:]
    # print(li)
    #features = [[gen, mar, dep, edu, emp, mon_income, co_mon_income, loan_amt, duration, cred, prop]]
    li[5]=int(li[5])
    li[6]=int(li[6])
    li[7]=int(li[7])
    li[8]=int(li[8])
    if(li[2]=='no'):
        li[2]=0
    elif(li[2]=='one'):
        li[2]=1
    elif(li[2]=='two'):
        li[2]=2
    else:
        li[2]=3

    if li[0]=='male':
        li[0]=1
    else:
        li[0]=0

    if(li[1]=='yes'):
        li[1]=1
    else:
        li[1]=0

    if li[3]=='Not_G':
        li[3]=0
    else:
        li[3]=1

    if li[4] =='job':
        li[4]=0
    else:
        li[4]=1

    if li[9]=='b_500':
        li[9]= 0
    else:
        li[9]=1

    if li[10]=='rural':
        li[10]=0
    elif li[10]=='semi-urban':
        li[10]=1
    else:
        li[10]=2

    li=[li]
    # data = np.array(li)
    df = pd.DataFrame(li,columns=features)
    k=model.predict(df)
    print(k)

if __name__== "__main__":
    main()
