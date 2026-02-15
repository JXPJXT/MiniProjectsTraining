public class fib {
    public static void main(String[] args){
    int n=9626;
    int[] f=new int[n+1];
    // System.out.print(fibcalc(n,f));   
    System.out.print(fibTab(n));   
         
    }
    public static int fibcalc(int n,int[] f){
        if(n==0||n==1){
            return n;
        }
        if(f[n]!=0){
            return f[n];
        }
        f[n]=fibcalc(n-1,f)+fibcalc(n-2,f);
        return f[n];
    }
    public static int fibTab(int n){
        int[] dp=new int[n+1];
        dp[1]=1;
        dp[0]=0;
        for(int i=2;i<=n;i++){
            dp[i]=dp[i-2]+dp[i-1];
        }
        return dp[n];
    }
}
