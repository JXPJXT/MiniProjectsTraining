import java.util.*;

public class ClimbStairs {
    public static void main(String[] args) {
        int n = 5;
        System.out.println(countWaysRecursive(n));
        
        int[] ways = new int[n + 1];
        Arrays.fill(ways, -1);
        System.out.println(countWayMemoization(n, ways));
    }

    public static int countWaysRecursive(int n) {
        if (n == 0) {
            return 1;
        }
        if (n < 0) {
            return 0;
        }
        return countWaysRecursive(n - 1) + countWaysRecursive(n - 2);
    }

    public static int countWayMemoization(int n, int[] ways) {
        if (n == 0) {
            return 1;
        }
        if (n < 0) {
            return 0;
        }
        if (ways[n] != -1) {
            return ways[n];
        }
        ways[n] = countWayMemoization(n - 1, ways) + countWayMemoization(n - 2, ways);
        return ways[n];
    }
}