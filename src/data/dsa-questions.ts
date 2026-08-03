export type Difficulty = "Easy" | "Medium" | "Hard";
export type DSAQuestion = {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  trick: string;       // memory/pattern trick
  approach: string;    // 1-liner approach
  code: string;        // clean solution
  timeComplexity: string;
  spaceComplexity: string;
  leetcodeUrl: string; // direct LeetCode problem link
};

export type DSACategory = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  questions: DSAQuestion[];
};

export const DSA_CATEGORIES: DSACategory[] = [
  {
    id: "arrays",
    name: "Arrays",
    emoji: "📦",
    color: "#6366f1",
    questions: [
      {
        id: "two-sum",
        title: "Two Sum",
        category: "Arrays",
        difficulty: "Easy",
        trick: "Store index in HashMap while scanning — 'complement = target - num'",
        approach: "For each num, check if (target - num) exists in map. If yes → answer. Else store num→index.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/two-sum/",
        code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) return [map.get(comp), i];
    map.set(nums[i], i);
  }
}`,
      },
      {
        id: "best-time-stock",
        title: "Best Time to Buy and Sell Stock",
        category: "Arrays",
        difficulty: "Easy",
        trick: "Track minPrice seen so far. Profit = current - minPrice. Keep maxProfit.",
        approach: "One pass: update minPrice if smaller, else update maxProfit.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
        code: `function maxProfit(prices) {
  let minPrice = Infinity, maxProfit = 0;
  for (const p of prices) {
    minPrice = Math.min(minPrice, p);
    maxProfit = Math.max(maxProfit, p - minPrice);
  }
  return maxProfit;
}`,
      },
      {
        id: "maximum-subarray",
        title: "Maximum Subarray (Kadane's)",
        category: "Arrays",
        difficulty: "Easy",
        trick: "Kadane: if running sum goes negative → reset to 0. Think 'carry or restart'.",
        approach: "Keep curSum. If curSum < 0 reset to 0. maxSum = max(maxSum, curSum + num).",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
        code: `function maxSubArray(nums) {
  let cur = 0, best = -Infinity;
  for (const n of nums) {
    cur = Math.max(n, cur + n);
    best = Math.max(best, cur);
  }
  return best;
}`,
      },
      {
        id: "move-zeroes",
        title: "Move Zeroes",
        category: "Arrays",
        difficulty: "Easy",
        trick: "Two pointers: left pointer is 'next non-zero slot'. Swap nums[left] and nums[i].",
        approach: "i scans array. When nums[i]≠0, swap with nums[left] and advance left.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/move-zeroes/",
        code: `function moveZeroes(nums) {
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[left], nums[i]] = [nums[i], nums[left]];
      left++;
    }
  }
}`,
      },
      {
        id: "remove-duplicates",
        title: "Remove Duplicates from Sorted Array",
        category: "Arrays",
        difficulty: "Easy",
        trick: "Slow pointer k = write head. Only advance when nums[i] ≠ nums[k-1].",
        approach: "k starts at 1. For i from 1 to n: if nums[i]≠nums[k-1], write nums[k++]=nums[i].",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
        code: `function removeDuplicates(nums) {
  let k = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[k - 1]) nums[k++] = nums[i];
  }
  return k;
}`,
      },
      {
        id: "merge-sorted-arrays",
        title: "Merge Sorted Arrays",
        category: "Arrays",
        difficulty: "Easy",
        trick: "Fill nums1 from the BACK. Three pointers: p1=m-1, p2=n-1, p=m+n-1.",
        approach: "Compare from end of both arrays and place larger element at tail of nums1.",
        timeComplexity: "O(m+n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/merge-sorted-array/",
        code: `function merge(nums1, m, nums2, n) {
  let p1 = m - 1, p2 = n - 1, p = m + n - 1;
  while (p2 >= 0) {
    if (p1 >= 0 && nums1[p1] > nums2[p2])
      nums1[p--] = nums1[p1--];
    else
      nums1[p--] = nums2[p2--];
  }
}`,
      },
      {
        id: "rotate-array",
        title: "Rotate Array",
        category: "Arrays",
        difficulty: "Medium",
        trick: "Reverse trick: reverse all → reverse first k → reverse rest k..n.",
        approach: "k = k % n. Reverse [0,n-1], then [0,k-1], then [k,n-1].",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/rotate-array/",
        code: `function rotate(nums, k) {
  k %= nums.length;
  const rev = (l, r) => {
    while (l < r) { [nums[l], nums[r]] = [nums[r], nums[l]]; l++; r--; }
  };
  rev(0, nums.length - 1);
  rev(0, k - 1);
  rev(k, nums.length - 1);
}`,
      },
      {
        id: "majority-element",
        title: "Majority Element",
        category: "Arrays",
        difficulty: "Easy",
        trick: "Boyer-Moore Voting: candidate cancels with opposites. Majority always survives.",
        approach: "If count=0, pick new candidate. If same as candidate count++, else count--.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/majority-element/",
        code: `function majorityElement(nums) {
  let candidate = 0, count = 0;
  for (const n of nums) {
    if (count === 0) candidate = n;
    count += n === candidate ? 1 : -1;
  }
  return candidate;
}`,
      },
      {
        id: "product-except-self",
        title: "Product Except Self",
        category: "Arrays",
        difficulty: "Medium",
        trick: "Left pass builds prefix products. Right pass multiplies suffix on the fly.",
        approach: "res[i] = product of all nums to the LEFT of i. Then multiply from right.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/product-of-array-except-self/",
        code: `function productExceptSelf(nums) {
  const n = nums.length, res = Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) { res[i] = prefix; prefix *= nums[i]; }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) { res[i] *= suffix; suffix *= nums[i]; }
  return res;
}`,
      },
      {
        id: "contains-duplicate",
        title: "Contains Duplicate",
        category: "Arrays",
        difficulty: "Easy",
        trick: "HashSet: if adding returns false (already exists) → duplicate found.",
        approach: "Add each element to Set. If set.size < nums.length at end → duplicate exists.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/",
        code: `function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length;
}`,
      },
    ],
  },
  {
    id: "arrays2",
    name: "Arrays (Advanced)",
    emoji: "🔢",
    color: "#8b5cf6",
    questions: [
      {
        id: "missing-number",
        title: "Missing Number",
        category: "Arrays",
        difficulty: "Easy",
        trick: "Expected sum = n*(n+1)/2. Missing = expected - actualSum.",
        approach: "Sum formula or XOR all indices and values — XOR cancels pairs.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/missing-number/",
        code: `function missingNumber(nums) {
  const n = nums.length;
  return n * (n + 1) / 2 - nums.reduce((a, b) => a + b, 0);
}`,
      },
      {
        id: "find-duplicate",
        title: "Find Duplicate Number",
        category: "Arrays",
        difficulty: "Medium",
        trick: "Floyd's cycle detection on array treated as linked list (value = next node).",
        approach: "Treat array as graph. nums[i] → nums[nums[i]]. Find cycle entry point.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/find-the-duplicate-number/",
        code: `function findDuplicate(nums) {
  let slow = nums[0], fast = nums[0];
  do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow !== fast);
  slow = nums[0];
  while (slow !== fast) { slow = nums[slow]; fast = nums[fast]; }
  return slow;
}`,
      },
      {
        id: "sort-colors",
        title: "Sort Colors (Dutch Flag)",
        category: "Arrays",
        difficulty: "Medium",
        trick: "3 pointers: low=0s boundary, mid=scanner, high=2s boundary. Swap boundaries.",
        approach: "If mid=0 swap with low++, mid++. If 2 swap with high--, keep mid. Else mid++.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/sort-colors/",
        code: `function sortColors(nums) {
  let lo = 0, mid = 0, hi = nums.length - 1;
  while (mid <= hi) {
    if (nums[mid] === 0) { [nums[lo], nums[mid]] = [nums[mid], nums[lo]]; lo++; mid++; }
    else if (nums[mid] === 2) { [nums[mid], nums[hi]] = [nums[hi], nums[mid]]; hi--; }
    else mid++;
  }
}`,
      },
      {
        id: "next-permutation",
        title: "Next Permutation",
        category: "Arrays",
        difficulty: "Medium",
        trick: "Find rightmost descent. Swap with next larger to its right. Reverse suffix.",
        approach: "From right find i where nums[i]<nums[i+1]. Find smallest>nums[i] in suffix, swap, reverse suffix.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/next-permutation/",
        code: `function nextPermutation(nums) {
  let i = nums.length - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;
  if (i >= 0) {
    let j = nums.length - 1;
    while (nums[j] <= nums[i]) j--;
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  let l = i + 1, r = nums.length - 1;
  while (l < r) { [nums[l], nums[r]] = [nums[r], nums[l]]; l++; r--; }
}`,
      },
      {
        id: "max-product-subarray",
        title: "Maximum Product Subarray",
        category: "Arrays",
        difficulty: "Medium",
        trick: "Track BOTH max and min (negative × negative = positive). Swap on negative number.",
        approach: "At each step maxProd = max(n, maxProd*n, minProd*n). Same for minProd.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/maximum-product-subarray/",
        code: `function maxProduct(nums) {
  let max = nums[0], min = nums[0], res = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const n = nums[i];
    const tmp = max;
    max = Math.max(n, max * n, min * n);
    min = Math.min(n, tmp * n, min * n);
    res = Math.max(res, max);
  }
  return res;
}`,
      },
      {
        id: "trapping-rain-water",
        title: "Trapping Rain Water",
        category: "Arrays",
        difficulty: "Hard",
        trick: "Two pointers: water at i = min(leftMax, rightMax) - height[i]. Move pointer with smaller max.",
        approach: "l=0, r=n-1. Maintain leftMax, rightMax. Move the smaller side inward.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/trapping-rain-water/",
        code: `function trap(height) {
  let l = 0, r = height.length - 1, lMax = 0, rMax = 0, water = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      height[l] >= lMax ? (lMax = height[l]) : (water += lMax - height[l]);
      l++;
    } else {
      height[r] >= rMax ? (rMax = height[r]) : (water += rMax - height[r]);
      r--;
    }
  }
  return water;
}`,
      },
      {
        id: "container-most-water",
        title: "Container With Most Water",
        category: "Arrays",
        difficulty: "Medium",
        trick: "Two pointers. Move the SHORTER wall inward — only shorter wall limits volume.",
        approach: "area = min(h[l],h[r]) * (r-l). Move shorter pointer. Track max.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
        code: `function maxArea(height) {
  let l = 0, r = height.length - 1, max = 0;
  while (l < r) {
    max = Math.max(max, Math.min(height[l], height[r]) * (r - l));
    height[l] < height[r] ? l++ : r--;
  }
  return max;
}`,
      },
      {
        id: "longest-consecutive",
        title: "Longest Consecutive Sequence",
        category: "Arrays",
        difficulty: "Medium",
        trick: "Only start counting from sequence BEGINNINGS: num where (num-1) NOT in set.",
        approach: "Put all in Set. For each num where num-1 absent, count streak forward.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/longest-consecutive-sequence/",
        code: `function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const n of set) {
    if (!set.has(n - 1)) {
      let cur = n, len = 1;
      while (set.has(cur + 1)) { cur++; len++; }
      best = Math.max(best, len);
    }
  }
  return best;
}`,
      },
      {
        id: "set-matrix-zeroes",
        title: "Set Matrix Zeroes",
        category: "Arrays",
        difficulty: "Medium",
        trick: "Use first row/col as markers. Record if first row/col themselves had zero separately.",
        approach: "Pass 1: mark first row & col. Pass 2: zero inner cells. Pass 3: apply first row/col.",
        timeComplexity: "O(m×n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/set-matrix-zeroes/",
        code: `function setZeroes(matrix) {
  const m = matrix.length, n = matrix[0].length;
  let row0 = false, col0 = false;
  for (let j = 0; j < n; j++) if (matrix[0][j] === 0) row0 = true;
  for (let i = 0; i < m; i++) if (matrix[i][0] === 0) col0 = true;
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      if (matrix[i][j] === 0) { matrix[i][0] = 0; matrix[0][j] = 0; }
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;
  if (row0) matrix[0].fill(0);
  if (col0) for (let i = 0; i < m; i++) matrix[i][0] = 0;
}`,
      },
      {
        id: "spiral-matrix",
        title: "Spiral Matrix",
        category: "Arrays",
        difficulty: "Medium",
        trick: "Shrink 4 boundaries (top, bottom, left, right) inward after each layer pass.",
        approach: "While top≤bottom && left≤right: traverse 4 directions, shrink bounds.",
        timeComplexity: "O(m×n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/spiral-matrix/",
        code: `function spiralOrder(matrix) {
  const res = [];
  let top = 0, bot = matrix.length - 1, left = 0, right = matrix[0].length - 1;
  while (top <= bot && left <= right) {
    for (let i = left; i <= right; i++) res.push(matrix[top][i]); top++;
    for (let i = top; i <= bot; i++) res.push(matrix[i][right]); right--;
    if (top <= bot) { for (let i = right; i >= left; i--) res.push(matrix[bot][i]); bot--; }
    if (left <= right) { for (let i = bot; i >= top; i--) res.push(matrix[i][left]); left++; }
  }
  return res;
}`,
      },
    ],
  },
  {
    id: "strings",
    name: "Strings",
    emoji: "🔤",
    color: "#f59e0b",
    questions: [
      {
        id: "valid-anagram",
        title: "Valid Anagram",
        category: "Strings",
        difficulty: "Easy",
        trick: "Frequency map: count chars in s, decrement for t. All must reach 0.",
        approach: "Sort both strings and compare, OR use 26-letter frequency array.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
        code: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const freq = Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    freq[s.charCodeAt(i) - 97]++;
    freq[t.charCodeAt(i) - 97]--;
  }
  return freq.every(v => v === 0);
}`,
      },
      {
        id: "group-anagrams",
        title: "Group Anagrams",
        category: "Strings",
        difficulty: "Medium",
        trick: "Key = sorted string. Same anagram group → same sorted key. Use HashMap.",
        approach: "For each word, sort its chars as key. Group into map[key].push(word).",
        timeComplexity: "O(n·k·log k)",
        spaceComplexity: "O(n·k)",
        leetcodeUrl: "https://leetcode.com/problems/group-anagrams/",
        code: `function groupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return [...map.values()];
}`,
      },
      {
        id: "longest-common-prefix",
        title: "Longest Common Prefix",
        category: "Strings",
        difficulty: "Easy",
        trick: "Take first string as prefix. Shorten it until every string starts with it.",
        approach: "For each str: while !str.startsWith(prefix) → chop last char of prefix.",
        timeComplexity: "O(n·m)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/longest-common-prefix/",
        code: `function longestCommonPrefix(strs) {
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++)
    while (!strs[i].startsWith(prefix)) prefix = prefix.slice(0, -1);
  return prefix;
}`,
      },
      {
        id: "reverse-words",
        title: "Reverse Words in String",
        category: "Strings",
        difficulty: "Medium",
        trick: "Split on spaces, filter empty tokens, reverse array, rejoin.",
        approach: "trim → split(/\\s+/) → reverse → join(' ')",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/reverse-words-in-a-string/",
        code: `function reverseWords(s) {
  return s.trim().split(/\s+/).reverse().join(' ');
}`,
      },
      {
        id: "valid-palindrome",
        title: "Valid Palindrome",
        category: "Strings",
        difficulty: "Easy",
        trick: "Two pointers from both ends. Skip non-alphanumeric. Compare lowercase.",
        approach: "l=0, r=end. Skip non-alnum. If chars differ → false. Else converge.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/valid-palindrome/",
        code: `function isPalindrome(s) {
  let l = 0, r = s.length - 1;
  while (l < r) {
    while (l < r && !/[a-z0-9]/.test(s[l].toLowerCase())) l++;
    while (l < r && !/[a-z0-9]/.test(s[r].toLowerCase())) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++; r--;
  }
  return true;
}`,
      },
      {
        id: "longest-palindrome",
        title: "Longest Palindrome",
        category: "Strings",
        difficulty: "Medium",
        trick: "Expand Around Center — for each char try odd & even centers, expand while equal.",
        approach: "For i in 0..n: expand(i,i) odd & expand(i,i+1) even. Track max window.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/longest-palindromic-substring/",
        code: `function longestPalindrome(s) {
  let res = '';
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    if (r - l - 1 > res.length) res = s.slice(l + 1, r);
  }
  for (let i = 0; i < s.length; i++) { expand(i, i); expand(i, i + 1); }
  return res;
}`,
      },
      {
        id: "longest-substring-no-repeat",
        title: "Longest Substring Without Repeating",
        category: "Strings",
        difficulty: "Medium",
        trick: "Sliding window + Map of last seen index. Jump left pointer to max(left, lastSeen+1).",
        approach: "Window [left, right]. Map stores last index of each char. Expand right, shrink left on repeat.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(min(n,m))",
        leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        code: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let left = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    if (map.has(s[r])) left = Math.max(left, map.get(s[r]) + 1);
    map.set(s[r], r);
    best = Math.max(best, r - left + 1);
  }
  return best;
}`,
      },
      {
        id: "minimum-window-substring",
        title: "Minimum Window Substring",
        category: "Strings",
        difficulty: "Hard",
        trick: "Sliding window with 'formed' counter. Shrink left only when window is valid.",
        approach: "need=freq(t), have=0. Expand right. When have==need shrink left. Track min window.",
        timeComplexity: "O(n+m)",
        spaceComplexity: "O(n+m)",
        leetcodeUrl: "https://leetcode.com/problems/minimum-window-substring/",
        code: `function minWindow(s, t) {
  const need = {}, win = {};
  for (const c of t) need[c] = (need[c] || 0) + 1;
  let have = 0, need_ = Object.keys(need).length;
  let res = '', l = 0;
  for (let r = 0; r < s.length; r++) {
    win[s[r]] = (win[s[r]] || 0) + 1;
    if (need[s[r]] && win[s[r]] === need[s[r]]) have++;
    while (have === need_) {
      const cur = s.slice(l, r + 1);
      if (!res || cur.length < res.length) res = cur;
      win[s[l]]--;
      if (need[s[l]] && win[s[l]] < need[s[l]]) have--;
      l++;
    }
  }
  return res;
}`,
      },
      {
        id: "string-compression",
        title: "String Compression",
        category: "Strings",
        difficulty: "Medium",
        trick: "Count consecutive same chars. Write char then count (if >1) in-place.",
        approach: "i=read ptr, k=write ptr. Count run, write char, write digits if count>1.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/string-compression/",
        code: `function compress(chars) {
  let i = 0, k = 0;
  while (i < chars.length) {
    let j = i, count = 0;
    while (j < chars.length && chars[j] === chars[i]) { j++; count++; }
    chars[k++] = chars[i];
    if (count > 1) for (const d of String(count)) chars[k++] = d;
    i = j;
  }
  return k;
}`,
      },
      {
        id: "decode-string",
        title: "Decode String",
        category: "Strings",
        difficulty: "Medium",
        trick: "Stack: push (currentStr, currentNum) on '['. On ']' pop and repeat.",
        approach: "Scan: digit→build num, '[' push to stack, ']' pop and expand, else append char.",
        timeComplexity: "O(output size)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/decode-string/",
        code: `function decodeString(s) {
  const stack = [];
  let cur = '', num = 0;
  for (const c of s) {
    if (c >= '0' && c <= '9') { num = num * 10 + +c; }
    else if (c === '[') { stack.push([cur, num]); cur = ''; num = 0; }
    else if (c === ']') {
      const [prev, k] = stack.pop();
      cur = prev + cur.repeat(k);
    } else cur += c;
  }
  return cur;
}`,
      },
      {
        id: "roman-to-integer",
        title: "Roman to Integer",
        category: "Strings",
        difficulty: "Easy",
        trick: "If current value < next value → subtract it. Otherwise add it.",
        approach: "Scan right to left. if val[i] < val[i+1] → subtract, else add.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/roman-to-integer/",
        code: `function romanToInt(s) {
  const map = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  let res = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]], nxt = map[s[i+1]];
    res += (nxt > cur) ? -cur : cur;
  }
  return res;
}`,
      },
      {
        id: "integer-to-roman",
        title: "Integer to Roman",
        category: "Strings",
        difficulty: "Medium",
        trick: "Greedy: from largest symbol down, subtract and append while num >= value.",
        approach: "Ordered pairs [(1000,'M'),(900,'CM'),...]. For each, while num>=val subtract and append.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/integer-to-roman/",
        code: `function intToRoman(num) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let res = '';
  for (let i = 0; i < vals.length; i++)
    while (num >= vals[i]) { res += syms[i]; num -= vals[i]; }
  return res;
}`,
      },
      {
        id: "implement-strstr",
        title: "Implement strStr() / Needle in Haystack",
        category: "Strings",
        difficulty: "Easy",
        trick: "Brute force: try every start in haystack. KMP for O(n+m).",
        approach: "Slide needle-length window across haystack. Compare substring.",
        timeComplexity: "O(n·m) brute / O(n+m) KMP",
        spaceComplexity: "O(1) brute",
        leetcodeUrl: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/",
        code: `function strStr(haystack, needle) {
  if (!needle) return 0;
  for (let i = 0; i <= haystack.length - needle.length; i++)
    if (haystack.slice(i, i + needle.length) === needle) return i;
  return -1;
}`,
      },
      {
        id: "isomorphic-strings",
        title: "Isomorphic Strings",
        category: "Strings",
        difficulty: "Easy",
        trick: "Two maps: s→t char mapping AND t→s reverse mapping. Both must be consistent.",
        approach: "For each pair (s[i],t[i]) check both maps agree. No two chars map to same.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/isomorphic-strings/",
        code: `function isIsomorphic(s, t) {
  const sm = {}, tm = {};
  for (let i = 0; i < s.length; i++) {
    if (sm[s[i]] && sm[s[i]] !== t[i]) return false;
    if (tm[t[i]] && tm[t[i]] !== s[i]) return false;
    sm[s[i]] = t[i]; tm[t[i]] = s[i];
  }
  return true;
}`,
      },
      {
        id: "ransom-note",
        title: "Ransom Note",
        category: "Strings",
        difficulty: "Easy",
        trick: "Count magazine chars. Subtract ransomNote chars. Any goes negative → false.",
        approach: "Build freq map from magazine. Decrement for each ransomNote char.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/ransom-note/",
        code: `function canConstruct(ransomNote, magazine) {
  const freq = Array(26).fill(0);
  for (const c of magazine) freq[c.charCodeAt(0) - 97]++;
  for (const c of ransomNote) {
    if (--freq[c.charCodeAt(0) - 97] < 0) return false;
  }
  return true;
}`,
      },
    ],
  },
  {
    id: "hashmap",
    name: "HashMap / Hashing",
    emoji: "#️⃣",
    color: "#10b981",
    questions: [
      {
        id: "frequency-count",
        title: "Frequency Count",
        category: "HashMap",
        difficulty: "Easy",
        trick: "Classic counter pattern: map[x] = (map[x]||0)+1",
        approach: "Single pass build frequency map. Read answers from map.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
        code: `function frequencyCount(arr) {
  const freq = new Map();
  for (const x of arr) freq.set(x, (freq.get(x) || 0) + 1);
  return freq;
}`,
      },
      {
        id: "happy-number",
        title: "Happy Number",
        category: "HashMap",
        difficulty: "Easy",
        trick: "Floyd's cycle detection OR a Set. If 1 → happy. If seen before → not happy.",
        approach: "Repeatedly sum of squares of digits. Detect cycle with Set.",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(log n)",
        leetcodeUrl: "https://leetcode.com/problems/happy-number/",
        code: `function isHappy(n) {
  const seen = new Set();
  while (n !== 1) {
    n = String(n).split('').reduce((s, d) => s + d * d, 0);
    if (seen.has(n)) return false;
    seen.add(n);
  }
  return true;
}`,
      },
      {
        id: "top-k-frequent",
        title: "Top K Frequent Elements",
        category: "HashMap",
        difficulty: "Medium",
        trick: "Bucket sort by frequency: buckets[freq].push(num). Collect from end.",
        approach: "Build freq map. Create buckets array[n+1]. Collect top k from high freq buckets.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
        code: `function topKFrequent(nums, k) {
  const freq = new Map();
  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);
  const buckets = Array.from({length: nums.length + 1}, () => []);
  for (const [n, f] of freq) buckets[f].push(n);
  const res = [];
  for (let i = buckets.length - 1; i >= 0 && res.length < k; i--)
    res.push(...buckets[i]);
  return res.slice(0, k);
}`,
      },
      {
        id: "subarray-sum-equals-k",
        title: "Subarray Sum Equals K",
        category: "HashMap",
        difficulty: "Medium",
        trick: "Prefix sum: if (prefixSum - k) was seen before, a valid subarray exists.",
        approach: "Map stores {prefixSum → count}. Start with {0:1}. At each i: check map[sum-k].",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/subarray-sum-equals-k/",
        code: `function subarraySum(nums, k) {
  const map = new Map([[0, 1]]);
  let sum = 0, count = 0;
  for (const n of nums) {
    sum += n;
    count += (map.get(sum - k) || 0);
    map.set(sum, (map.get(sum) || 0) + 1);
  }
  return count;
}`,
      },
      {
        id: "valid-sudoku",
        title: "Valid Sudoku",
        category: "HashMap",
        difficulty: "Medium",
        trick: "3 sets: rows[i], cols[j], boxes[i/3*3+j/3]. A digit can't repeat in any.",
        approach: "For each cell: check row, col, and 3×3 box sets. If found → invalid.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/valid-sudoku/",
        code: `function isValidSudoku(board) {
  const rows = Array.from({length:9}, () => new Set());
  const cols = Array.from({length:9}, () => new Set());
  const boxes = Array.from({length:9}, () => new Set());
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 9; j++) {
      const c = board[i][j];
      if (c === '.') continue;
      const b = Math.floor(i/3)*3 + Math.floor(j/3);
      if (rows[i].has(c) || cols[j].has(c) || boxes[b].has(c)) return false;
      rows[i].add(c); cols[j].add(c); boxes[b].add(c);
    }
  return true;
}`,
      },
      {
        id: "first-unique-char",
        title: "First Unique Character",
        category: "HashMap",
        difficulty: "Easy",
        trick: "Two passes: first build freq, second find first with freq=1.",
        approach: "Pass 1: count chars. Pass 2: return index of first char where count===1.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/first-unique-character-in-a-string/",
        code: `function firstUniqChar(s) {
  const freq = Array(26).fill(0);
  for (const c of s) freq[c.charCodeAt(0) - 97]++;
  for (let i = 0; i < s.length; i++)
    if (freq[s.charCodeAt(i) - 97] === 1) return i;
  return -1;
}`,
      },
    ],
  },
  {
    id: "two-pointer",
    name: "Two Pointer",
    emoji: "👆👆",
    color: "#ec4899",
    questions: [
      {
        id: "two-sum-ii",
        title: "Two Sum II (Sorted Array)",
        category: "Two Pointer",
        difficulty: "Easy",
        trick: "Sorted → two pointers from ends. Sum too big → move right left. Too small → move left right.",
        approach: "l=0, r=n-1. If sum==target return. If sum<target l++ else r--.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
        code: `function twoSum(numbers, target) {
  let l = 0, r = numbers.length - 1;
  while (l < r) {
    const s = numbers[l] + numbers[r];
    if (s === target) return [l+1, r+1];
    s < target ? l++ : r--;
  }
}`,
      },
      {
        id: "3sum",
        title: "3 Sum",
        category: "Two Pointer",
        difficulty: "Medium",
        trick: "Sort first. Fix i, two-pointer for rest. Skip duplicates carefully.",
        approach: "Sort. For each i (skip dup): two-ptr l=i+1, r=end. Skip dup on l & r too.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/3sum/",
        code: `function threeSum(nums) {
  nums.sort((a,b) => a-b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) continue;
    let l = i+1, r = nums.length-1;
    while (l < r) {
      const s = nums[i]+nums[l]+nums[r];
      if (s === 0) {
        res.push([nums[i],nums[l],nums[r]]);
        while (l < r && nums[l]===nums[l+1]) l++;
        while (l < r && nums[r]===nums[r-1]) r--;
        l++; r--;
      } else s < 0 ? l++ : r--;
    }
  }
  return res;
}`,
      },
      {
        id: "4sum",
        title: "4 Sum",
        category: "Two Pointer",
        difficulty: "Medium",
        trick: "3Sum + one more fixed pointer. Sort + 4 pointers with duplicate skips.",
        approach: "Fix i, fix j=i+1, two-ptr l=j+1, r=end. Skip dups at all levels.",
        timeComplexity: "O(n³)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/4sum/",
        code: `function fourSum(nums, target) {
  nums.sort((a,b)=>a-b);
  const res = [];
  for (let i = 0; i < nums.length-3; i++) {
    if (i>0 && nums[i]===nums[i-1]) continue;
    for (let j = i+1; j < nums.length-2; j++) {
      if (j>i+1 && nums[j]===nums[j-1]) continue;
      let l=j+1, r=nums.length-1;
      while (l<r) {
        const s = nums[i]+nums[j]+nums[l]+nums[r];
        if (s===target) {
          res.push([nums[i],nums[j],nums[l],nums[r]]);
          while(l<r&&nums[l]===nums[l+1])l++;
          while(l<r&&nums[r]===nums[r-1])r--;
          l++;r--;
        } else s<target?l++:r--;
      }
    }
  }
  return res;
}`,
      },
    ],
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    emoji: "🪟",
    color: "#3b82f6",
    questions: [
      {
        id: "max-sum-subarray",
        title: "Maximum Sum Subarray of Size K",
        category: "Sliding Window",
        difficulty: "Easy",
        trick: "Fixed window: add right element, subtract leftmost as window slides.",
        approach: "First window sum. Then slide: add nums[i], subtract nums[i-k]. Track max.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/maximum-average-subarray-i/",
        code: `function maxSumSubarray(nums, k) {
  let sum = nums.slice(0,k).reduce((a,b)=>a+b,0), max = sum;
  for (let i = k; i < nums.length; i++) {
    sum += nums[i] - nums[i-k];
    max = Math.max(max, sum);
  }
  return max;
}`,
      },
      {
        id: "fruits-into-baskets",
        title: "Fruits Into Baskets",
        category: "Sliding Window",
        difficulty: "Medium",
        trick: "At most 2 distinct fruits = longest subarray with ≤2 distinct values.",
        approach: "Expand right. If map.size>2, shrink left until ≤2 distinct. Track max window.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/fruit-into-baskets/",
        code: `function totalFruit(fruits) {
  const map = new Map();
  let l = 0, max = 0;
  for (let r = 0; r < fruits.length; r++) {
    map.set(fruits[r], (map.get(fruits[r])||0)+1);
    while (map.size > 2) {
      map.set(fruits[l], map.get(fruits[l])-1);
      if (map.get(fruits[l])===0) map.delete(fruits[l]);
      l++;
    }
    max = Math.max(max, r-l+1);
  }
  return max;
}`,
      },
      {
        id: "longest-repeating-replacement",
        title: "Longest Repeating Character Replacement",
        category: "Sliding Window",
        difficulty: "Medium",
        trick: "Window is valid if (windowLen - maxFreq) ≤ k. Only grow, never shrink in length.",
        approach: "Track maxFreq in window. If windowLen-maxFreq>k slide left. Track max.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/longest-repeating-character-replacement/",
        code: `function characterReplacement(s, k) {
  const freq = Array(26).fill(0);
  let l = 0, maxFreq = 0, res = 0;
  for (let r = 0; r < s.length; r++) {
    maxFreq = Math.max(maxFreq, ++freq[s.charCodeAt(r)-65]);
    if (r-l+1-maxFreq > k) freq[s.charCodeAt(l++)-65]--;
    res = Math.max(res, r-l+1);
  }
  return res;
}`,
      },
      {
        id: "permutation-in-string",
        title: "Permutation in String",
        category: "Sliding Window",
        difficulty: "Medium",
        trick: "Fixed window = len(s1). Match freq count of s1. Track 'matches' counter.",
        approach: "26-char freq diff. 'matches' = chars where diff=0. Slide window. Return when matches=26.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/permutation-in-string/",
        code: `function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;
  const need = Array(26).fill(0), win = Array(26).fill(0);
  for (const c of s1) need[c.charCodeAt(0)-97]++;
  const k = s1.length;
  for (let i = 0; i < s2.length; i++) {
    win[s2.charCodeAt(i)-97]++;
    if (i >= k) win[s2.charCodeAt(i-k)-97]--;
    if (win.every((v,j) => v===need[j])) return true;
  }
  return false;
}`,
      },
      {
        id: "find-all-anagrams",
        title: "Find All Anagrams in String",
        category: "Sliding Window",
        difficulty: "Medium",
        trick: "Same as Permutation in String, but collect ALL valid window start indices.",
        approach: "Fixed window size p.length. When freq arrays match, push window start to result.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
        code: `function findAnagrams(s, p) {
  const need = Array(26).fill(0), win = Array(26).fill(0);
  for (const c of p) need[c.charCodeAt(0)-97]++;
  const res = [];
  for (let i = 0; i < s.length; i++) {
    win[s.charCodeAt(i)-97]++;
    if (i >= p.length) win[s.charCodeAt(i-p.length)-97]--;
    if (win.every((v,j) => v===need[j])) res.push(i-p.length+1);
  }
  return res;
}`,
      },
      {
        id: "sliding-window-maximum",
        title: "Sliding Window Maximum",
        category: "Sliding Window",
        difficulty: "Hard",
        trick: "Monotonic deque: keep indices of useful maximums. Front = current max. Pop smaller from back.",
        approach: "Deque stores indices in decreasing order of value. Front is max. Evict expired indices.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(k)",
        leetcodeUrl: "https://leetcode.com/problems/sliding-window-maximum/",
        code: `function maxSlidingWindow(nums, k) {
  const dq = [], res = [];
  for (let i = 0; i < nums.length; i++) {
    while (dq.length && dq[0] <= i-k) dq.shift();
    while (dq.length && nums[dq[dq.length-1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (i >= k-1) res.push(nums[dq[0]]);
  }
  return res;
}`,
      },
    ],
  },
  {
    id: "binary-search",
    name: "Binary Search",
    emoji: "🔍",
    color: "#f97316",
    questions: [
      {
        id: "binary-search",
        title: "Binary Search",
        category: "Binary Search",
        difficulty: "Easy",
        trick: "mid = lo + (hi-lo)/2 to avoid overflow. While lo<=hi. Miss → lo>hi.",
        approach: "Standard: lo=0, hi=n-1. mid=(lo+hi)>>1. Compare and shrink half.",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/binary-search/",
        code: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    nums[mid] < target ? lo = mid+1 : hi = mid-1;
  }
  return -1;
}`,
      },
      {
        id: "search-insert-position",
        title: "Search Insert Position",
        category: "Binary Search",
        difficulty: "Easy",
        trick: "Standard BS. When loop ends, lo = correct insertion point.",
        approach: "BS: if found return mid. Otherwise return lo (insertion point).",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/search-insert-position/",
        code: `function searchInsert(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    nums[mid] < target ? lo = mid+1 : hi = mid-1;
  }
  return lo;
}`,
      },
      {
        id: "search-rotated-array",
        title: "Search in Rotated Sorted Array",
        category: "Binary Search",
        difficulty: "Medium",
        trick: "One half is always sorted. Determine which half is sorted, then decide which half target is in.",
        approach: "If nums[lo]≤nums[mid]: left sorted. Check if target in [lo,mid] range. Else check right.",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
        code: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo+hi)>>1;
    if (nums[mid]===target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo]<=target && target<nums[mid]) hi=mid-1;
      else lo=mid+1;
    } else {
      if (nums[mid]<target && target<=nums[hi]) lo=mid+1;
      else hi=mid-1;
    }
  }
  return -1;
}`,
      },
      {
        id: "find-peak-element",
        title: "Find Peak Element",
        category: "Binary Search",
        difficulty: "Medium",
        trick: "If nums[mid]<nums[mid+1], peak is on RIGHT side. Else on LEFT side.",
        approach: "Binary search: always move toward the higher neighbor.",
        timeComplexity: "O(log n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/find-peak-element/",
        code: `function findPeakElement(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo+hi)>>1;
    if (nums[mid] < nums[mid+1]) lo = mid+1;
    else hi = mid;
  }
  return lo;
}`,
      },
      {
        id: "koko-eating-bananas",
        title: "Koko Eating Bananas",
        category: "Binary Search",
        difficulty: "Medium",
        trick: "BS on answer space [1, max(piles)]. Smallest k where total hours ≤ h.",
        approach: "BS speed from 1 to maxPile. For each k compute hours=Σceil(p/k). Find min valid k.",
        timeComplexity: "O(n log m)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/koko-eating-bananas/",
        code: `function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = (lo+hi)>>1;
    const hours = piles.reduce((s,p) => s + Math.ceil(p/mid), 0);
    hours <= h ? hi = mid : lo = mid+1;
  }
  return lo;
}`,
      },
      {
        id: "median-two-sorted-arrays",
        title: "Median of Two Sorted Arrays",
        category: "Binary Search",
        difficulty: "Hard",
        trick: "Binary search on smaller array's partition. Ensure left halves are ≤ right halves.",
        approach: "Partition smaller array at i, larger at j=(m+n+1)/2-i. Ensure A[i-1]≤B[j] and B[j-1]≤A[i].",
        timeComplexity: "O(log(min(m,n)))",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
        code: `function findMedianSortedArrays(nums1, nums2) {
  if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
  const m=nums1.length, n=nums2.length, half=(m+n+1)>>1;
  let lo=0, hi=m;
  while (lo<=hi) {
    const i=(lo+hi)>>1, j=half-i;
    const A=nums1, B=nums2;
    if (i<m && B[j-1]>A[i]) lo=i+1;
    else if (i>0 && A[i-1]>B[j]) hi=i-1;
    else {
      const maxL = Math.max(i>0?A[i-1]:-Inf, j>0?B[j-1]:-Inf);
      if ((m+n)%2) return maxL;
      const minR = Math.min(i<m?A[i]:Inf, j<n?B[j]:Inf);
      return (maxL+minR)/2;
    }
  }
  const Inf=Infinity;
}`,
      },
    ],
  },
  {
    id: "linked-list",
    name: "Linked List",
    emoji: "🔗",
    color: "#14b8a6",
    questions: [
      {
        id: "reverse-linked-list",
        title: "Reverse Linked List",
        category: "Linked List",
        difficulty: "Easy",
        trick: "Three pointers: prev=null, curr, next. Rewire one step at a time.",
        approach: "prev=null. While curr: save next, point curr.next=prev, move prev and curr forward.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
        code: `function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
      },
      {
        id: "middle-node",
        title: "Middle of Linked List",
        category: "Linked List",
        difficulty: "Easy",
        trick: "Slow & Fast pointers. Fast moves 2x. When fast reaches end, slow is at middle.",
        approach: "slow=head, fast=head. While fast && fast.next: slow=slow.next, fast=fast.next.next.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/middle-of-the-linked-list/",
        code: `function middleNode(head) {
  let slow = head, fast = head;
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
  return slow;
}`,
      },
      {
        id: "detect-cycle",
        title: "Detect Cycle in Linked List",
        category: "Linked List",
        difficulty: "Easy",
        trick: "Floyd's: slow 1 step, fast 2 steps. If they meet → cycle exists.",
        approach: "If fast===slow → cycle. If fast reaches null → no cycle.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle/",
        code: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next; fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
      },
      {
        id: "merge-two-lists",
        title: "Merge Two Sorted Lists",
        category: "Linked List",
        difficulty: "Easy",
        trick: "Dummy head simplifies edge cases. Compare l1 & l2, attach smaller, advance that pointer.",
        approach: "dummy→result. While both non-null: pick smaller, append. Attach remaining.",
        timeComplexity: "O(m+n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
        code: `function mergeTwoLists(l1, l2) {
  const dummy = {next:null};
  let cur = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { cur.next=l1; l1=l1.next; }
    else { cur.next=l2; l2=l2.next; }
    cur = cur.next;
  }
  cur.next = l1 || l2;
  return dummy.next;
}`,
      },
      {
        id: "remove-nth-node",
        title: "Remove Nth Node From End",
        category: "Linked List",
        difficulty: "Medium",
        trick: "Two pointers n apart. When fast hits end, slow is just before target node.",
        approach: "dummy→head. fast advances n+1 steps. Then both advance until fast=null. Remove slow.next.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
        code: `function removeNthFromEnd(head, n) {
  const dummy = {next: head};
  let fast = dummy, slow = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next;
  while (fast) { slow = slow.next; fast = fast.next; }
  slow.next = slow.next.next;
  return dummy.next;
}`,
      },
      {
        id: "palindrome-linked-list",
        title: "Palindrome Linked List",
        category: "Linked List",
        difficulty: "Easy",
        trick: "Find middle, reverse second half, compare with first half.",
        approach: "slow/fast to find middle. Reverse from middle. Compare halves.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/palindrome-linked-list/",
        code: `function isPalindrome(head) {
  let slow = head, fast = head;
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
  let prev = null, curr = slow;
  while (curr) { const nxt=curr.next; curr.next=prev; prev=curr; curr=nxt; }
  let l=head, r=prev;
  while (r) { if (l.val!==r.val) return false; l=l.next; r=r.next; }
  return true;
}`,
      },
      {
        id: "intersection-linked-list",
        title: "Intersection of Two Linked Lists",
        category: "Linked List",
        difficulty: "Easy",
        trick: "Both pointers walk A+B and B+A in total. They meet at intersection or null.",
        approach: "pA starts at A, pB starts at B. When one reaches null redirect to other head. They meet at intersection.",
        timeComplexity: "O(m+n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/intersection-of-two-linked-lists/",
        code: `function getIntersectionNode(headA, headB) {
  let a = headA, b = headB;
  while (a !== b) {
    a = a ? a.next : headB;
    b = b ? b.next : headA;
  }
  return a;
}`,
      },
      {
        id: "add-two-numbers",
        title: "Add Two Numbers",
        category: "Linked List",
        difficulty: "Medium",
        trick: "Simulate addition with carry. Both lists store digits in reverse order.",
        approach: "Walk both lists + carry. sum=l1.val+l2.val+carry. New node = sum%10. carry=sum/10.",
        timeComplexity: "O(max(m,n))",
        spaceComplexity: "O(max(m,n))",
        leetcodeUrl: "https://leetcode.com/problems/add-two-numbers/",
        code: `function addTwoNumbers(l1, l2) {
  const dummy = {next:null}; let cur=dummy, carry=0;
  while (l1 || l2 || carry) {
    const sum=(l1?.val||0)+(l2?.val||0)+carry;
    carry=Math.floor(sum/10);
    cur.next={val:sum%10,next:null}; cur=cur.next;
    l1=l1?.next; l2=l2?.next;
  }
  return dummy.next;
}`,
      },
      {
        id: "reverse-k-groups",
        title: "Reverse Nodes in K-Group",
        category: "Linked List",
        difficulty: "Hard",
        trick: "Check k nodes exist. Reverse k nodes. Recurse on rest. Connect.",
        approach: "Count k nodes. If <k return head. Reverse k. Tail of reversed connects to recurse(remaining).",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n/k)",
        leetcodeUrl: "https://leetcode.com/problems/reverse-nodes-in-k-group/",
        code: `function reverseKGroup(head, k) {
  let count=0, node=head;
  while(node && count<k){node=node.next;count++;}
  if(count<k) return head;
  let prev=null, curr=head;
  for(let i=0;i<k;i++){const nxt=curr.next;curr.next=prev;prev=curr;curr=nxt;}
  head.next=reverseKGroup(curr,k);
  return prev;
}`,
      },
      {
        id: "copy-random-pointer",
        title: "Copy List with Random Pointer",
        category: "Linked List",
        difficulty: "Medium",
        trick: "HashMap: old node → new clone. First pass clone all nodes, second pass set next and random.",
        approach: "map.set(node, new Node(node.val)). Then for each node: clone.next=map[node.next], clone.random=map[node.random].",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/copy-list-with-random-pointer/",
        code: `function copyRandomList(head) {
  const map = new Map();
  let cur = head;
  while (cur) { map.set(cur, {val:cur.val,next:null,random:null}); cur=cur.next; }
  cur = head;
  while (cur) {
    if (cur.next) map.get(cur).next = map.get(cur.next);
    if (cur.random) map.get(cur).random = map.get(cur.random);
    cur = cur.next;
  }
  return map.get(head);
}`,
      },
    ],
  },
  {
    id: "stack",
    name: "Stack",
    emoji: "📚",
    color: "#ef4444",
    questions: [
      {
        id: "valid-parentheses",
        title: "Valid Parentheses",
        category: "Stack",
        difficulty: "Easy",
        trick: "Push open brackets. On close bracket, check top of stack matches. Empty at end = valid.",
        approach: "Map close→open. Push opens. On close: pop and compare. Final stack must be empty.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
        code: `function isValid(s) {
  const map = {')':'(',']':'[','}':'{'};
  const stack = [];
  for (const c of s) {
    if ('([{'.includes(c)) stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
}`,
      },
      {
        id: "min-stack",
        title: "Min Stack",
        category: "Stack",
        difficulty: "Medium",
        trick: "Keep a parallel minStack. Push to minStack only when new val ≤ current min.",
        approach: "Two stacks: main and minStack. getMin() returns minStack.top. Pop both when main pops.",
        timeComplexity: "O(1) all ops",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/min-stack/",
        code: `class MinStack {
  constructor() { this.stack=[]; this.minStack=[]; }
  push(val) {
    this.stack.push(val);
    const min = this.minStack.length ? this.minStack.at(-1) : Infinity;
    this.minStack.push(Math.min(val, min));
  }
  pop() { this.stack.pop(); this.minStack.pop(); }
  top() { return this.stack.at(-1); }
  getMin() { return this.minStack.at(-1); }
}`,
      },
      {
        id: "next-greater-element",
        title: "Next Greater Element",
        category: "Stack",
        difficulty: "Medium",
        trick: "Monotonic stack: process right to left. Stack keeps candidates for next greater.",
        approach: "Stack shrinks while top ≤ current. Top is next greater. Push current. Answer = top or -1.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/next-greater-element-i/",
        code: `function nextGreaterElement(nums1, nums2) {
  const map = new Map(), stack = [];
  for (const n of nums2) {
    while (stack.length && stack.at(-1) < n) map.set(stack.pop(), n);
    stack.push(n);
  }
  return nums1.map(n => map.get(n) ?? -1);
}`,
      },
      {
        id: "daily-temperatures",
        title: "Daily Temperatures",
        category: "Stack",
        difficulty: "Medium",
        trick: "Monotonic decreasing stack of indices. When hotter day found, pop and calculate gap.",
        approach: "Stack stores indices. For each i: while stack.top temp < temps[i], pop and set ans[idx]=i-idx.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/daily-temperatures/",
        code: `function dailyTemperatures(temps) {
  const res = Array(temps.length).fill(0), stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack.at(-1)] < temps[i]) {
      const idx = stack.pop();
      res[idx] = i - idx;
    }
    stack.push(i);
  }
  return res;
}`,
      },
      {
        id: "largest-rectangle",
        title: "Largest Rectangle in Histogram",
        category: "Stack",
        difficulty: "Hard",
        trick: "Monotonic increasing stack. When bar decreases, pop and compute area using width.",
        approach: "Stack stores (index, height). On each bar: pop taller bars, compute area. Push with earliest start.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
        code: `function largestRectangleArea(heights) {
  const stack = [], n = heights.length; // [start, height]
  let max = 0;
  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : heights[i];
    let start = i;
    while (stack.length && stack.at(-1)[1] > h) {
      const [s, ht] = stack.pop();
      max = Math.max(max, ht * (i - s));
      start = s;
    }
    stack.push([start, h]);
  }
  return max;
}`,
      },
      {
        id: "evaluate-postfix",
        title: "Evaluate Postfix (RPN)",
        category: "Stack",
        difficulty: "Medium",
        trick: "Stack: push numbers, on operator pop two, apply operator, push result.",
        approach: "Scan tokens. Number → push. Operator → pop b then a, push (a op b).",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
        code: `function evalRPN(tokens) {
  const stack = [];
  const ops = {'+': (a,b)=>a+b, '-':(a,b)=>a-b, '*':(a,b)=>a*b, '/':(a,b)=>Math.trunc(a/b)};
  for (const t of tokens) {
    if (ops[t]) { const b=stack.pop(), a=stack.pop(); stack.push(ops[t](a,b)); }
    else stack.push(+t);
  }
  return stack[0];
}`,
      },
      {
        id: "simplify-path",
        title: "Simplify Path",
        category: "Stack",
        difficulty: "Medium",
        trick: "Split by '/'. Push valid parts. '..' pops. '.' and '' ignored. Join with '/'.",
        approach: "stack = []. Split by '/'. For each part: '..'→pop, skip '.'/'', else push. Return '/'+stack.join('/').",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/simplify-path/",
        code: `function simplifyPath(path) {
  const stack = [];
  for (const p of path.split('/')) {
    if (p === '..') stack.pop();
    else if (p && p !== '.') stack.push(p);
  }
  return '/' + stack.join('/');
}`,
      },
    ],
  },
  {
    id: "queue",
    name: "Queue / Deque",
    emoji: "🚶",
    color: "#a855f7",
    questions: [
      {
        id: "implement-queue-stacks",
        title: "Implement Queue using Stacks",
        category: "Queue",
        difficulty: "Easy",
        trick: "Two stacks: inbox and outbox. Pour inbox→outbox only when outbox empty.",
        approach: "push→inbox. pop/peek→if outbox empty, transfer all from inbox to outbox, then pop outbox.",
        timeComplexity: "O(1) amortized",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/implement-queue-using-stacks/",
        code: `class MyQueue {
  constructor() { this.inbox=[]; this.outbox=[]; }
  push(x) { this.inbox.push(x); }
  _transfer() { if(!this.outbox.length) while(this.inbox.length) this.outbox.push(this.inbox.pop()); }
  pop() { this._transfer(); return this.outbox.pop(); }
  peek() { this._transfer(); return this.outbox.at(-1); }
  empty() { return !this.inbox.length && !this.outbox.length; }
}`,
      },
      {
        id: "rotten-oranges",
        title: "Rotten Oranges",
        category: "Queue",
        difficulty: "Medium",
        trick: "Multi-source BFS from all rotten oranges simultaneously. Count fresh. Time = BFS levels.",
        approach: "Enqueue all initial rotten. BFS: spread rot to 4 neighbors, decrement fresh count. Return minutes or -1.",
        timeComplexity: "O(m×n)",
        spaceComplexity: "O(m×n)",
        leetcodeUrl: "https://leetcode.com/problems/rotting-oranges/",
        code: `function orangesRotting(grid) {
  const m=grid.length, n=grid[0].length, q=[];
  let fresh=0, mins=0;
  for(let i=0;i<m;i++) for(let j=0;j<n;j++) {
    if(grid[i][j]===2) q.push([i,j]);
    else if(grid[i][j]===1) fresh++;
  }
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  while(q.length && fresh>0) {
    mins++;
    for(let k=q.length;k>0;k--) {
      const [r,c]=q.shift();
      for(const [dr,dc] of dirs) {
        const nr=r+dr, nc=c+dc;
        if(nr>=0&&nr<m&&nc>=0&&nc<n&&grid[nr][nc]===1) {
          grid[nr][nc]=2; fresh--; q.push([nr,nc]);
        }
      }
    }
  }
  return fresh===0?mins:-1;
}`,
      },
      {
        id: "design-circular-deque",
        title: "Design Circular Deque",
        category: "Queue",
        difficulty: "Medium",
        trick: "Array with front and rear pointers. Wrap around using modulo. Track size.",
        approach: "Fixed array of k+1. front=0, rear=0, size=0. insertFront decrements front mod, insertLast increments rear mod.",
        timeComplexity: "O(1) all ops",
        spaceComplexity: "O(k)",
        leetcodeUrl: "https://leetcode.com/problems/design-circular-deque/",
        code: `class MyCircularDeque {
  constructor(k) { this.buf=Array(k+1).fill(0); this.cap=k+1; this.f=0; this.r=0; }
  insertFront(v) {
    if(this.isFull()) return false;
    this.f=(this.f-1+this.cap)%this.cap; this.buf[this.f]=v; return true;
  }
  insertLast(v) {
    if(this.isFull()) return false;
    this.buf[this.r]=v; this.r=(this.r+1)%this.cap; return true;
  }
  deleteFront() { if(this.isEmpty()) return false; this.f=(this.f+1)%this.cap; return true; }
  deleteLast() { if(this.isEmpty()) return false; this.r=(this.r-1+this.cap)%this.cap; return true; }
  getFront() { return this.isEmpty()?-1:this.buf[this.f]; }
  getRear() { return this.isEmpty()?-1:this.buf[(this.r-1+this.cap)%this.cap]; }
  isEmpty() { return this.f===this.r; }
  isFull() { return (this.r+1)%this.cap===this.f; }
}`,
      },
    ],
  },
  {
    id: "trees",
    name: "Trees",
    emoji: "🌳",
    color: "#22c55e",
    questions: [
      {
        id: "inorder-traversal",
        title: "Inorder Traversal",
        category: "Trees",
        difficulty: "Easy",
        trick: "Inorder = Left → Root → Right. Iterative: push left chain, pop and process, go right.",
        approach: "Recursive: inorder(left), visit root, inorder(right). Iterative uses stack.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        leetcodeUrl: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
        code: `function inorderTraversal(root) {
  const res = [], stack = [];
  let cur = root;
  while (cur || stack.length) {
    while (cur) { stack.push(cur); cur = cur.left; }
    cur = stack.pop();
    res.push(cur.val);
    cur = cur.right;
  }
  return res;
}`,
      },
      {
        id: "level-order",
        title: "Level Order Traversal (BFS)",
        category: "Trees",
        difficulty: "Medium",
        trick: "BFS with queue. Process level by level: snapshot queue.length at start of each level.",
        approach: "Queue starts with root. For each level: dequeue levelSize nodes, collect vals, enqueue children.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
        code: `function levelOrder(root) {
  if (!root) return [];
  const res = [], q = [root];
  while (q.length) {
    const level = [], size = q.length;
    for (let i = 0; i < size; i++) {
      const node = q.shift();
      level.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    res.push(level);
  }
  return res;
}`,
      },
      {
        id: "maximum-depth",
        title: "Maximum Depth of Binary Tree",
        category: "Trees",
        difficulty: "Easy",
        trick: "Depth = 1 + max(depth(left), depth(right)). Base case: null → 0.",
        approach: "Recursive: return 0 if null. Else 1 + max(left depth, right depth).",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        leetcodeUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
        code: `function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
      },
      {
        id: "diameter-tree",
        title: "Diameter of Binary Tree",
        category: "Trees",
        difficulty: "Easy",
        trick: "At each node: diameter = leftDepth + rightDepth. Update global max. Return depth for parent.",
        approach: "DFS returns depth. At each node update ans = max(ans, left+right). Return 1+max(left,right).",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        leetcodeUrl: "https://leetcode.com/problems/diameter-of-binary-tree/",
        code: `function diameterOfBinaryTree(root) {
  let ans = 0;
  function depth(node) {
    if (!node) return 0;
    const l = depth(node.left), r = depth(node.right);
    ans = Math.max(ans, l + r);
    return 1 + Math.max(l, r);
  }
  depth(root);
  return ans;
}`,
      },
      {
        id: "balanced-tree",
        title: "Balanced Binary Tree",
        category: "Trees",
        difficulty: "Easy",
        trick: "Return -1 as sentinel for unbalanced. If |left-right|>1 propagate -1 upward.",
        approach: "DFS returns height or -1. If any child returns -1 or diff>1 → return -1.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        leetcodeUrl: "https://leetcode.com/problems/balanced-binary-tree/",
        code: `function isBalanced(root) {
  function height(node) {
    if (!node) return 0;
    const l = height(node.left);
    if (l === -1) return -1;
    const r = height(node.right);
    if (r === -1 || Math.abs(l - r) > 1) return -1;
    return 1 + Math.max(l, r);
  }
  return height(root) !== -1;
}`,
      },
      {
        id: "same-tree",
        title: "Same Tree",
        category: "Trees",
        difficulty: "Easy",
        trick: "Both null → true. One null → false. Vals differ → false. Recurse both sides.",
        approach: "Base cases first. Then p.val===q.val && sameTree(p.left,q.left) && sameTree(p.right,q.right).",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        leetcodeUrl: "https://leetcode.com/problems/same-tree/",
        code: `function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
      },
      {
        id: "symmetric-tree",
        title: "Symmetric Tree",
        category: "Trees",
        difficulty: "Easy",
        trick: "Mirror check: compare left.left with right.right AND left.right with right.left.",
        approach: "isMirror(left, right): both null→true, one null→false, vals match → recurse swapped.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        leetcodeUrl: "https://leetcode.com/problems/symmetric-tree/",
        code: `function isSymmetric(root) {
  function mirror(l, r) {
    if (!l && !r) return true;
    if (!l || !r || l.val !== r.val) return false;
    return mirror(l.left, r.right) && mirror(l.right, r.left);
  }
  return mirror(root.left, root.right);
}`,
      },
      {
        id: "path-sum",
        title: "Path Sum",
        category: "Trees",
        difficulty: "Easy",
        trick: "Subtract node val from target. At leaf: check if remainder === 0.",
        approach: "DFS: subtract node.val from target. At leaf node return target===0.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        leetcodeUrl: "https://leetcode.com/problems/path-sum/",
        code: `function hasPathSum(root, target) {
  if (!root) return false;
  if (!root.left && !root.right) return root.val === target;
  return hasPathSum(root.left, target - root.val) ||
         hasPathSum(root.right, target - root.val);
}`,
      },
      {
        id: "lowest-common-ancestor",
        title: "Lowest Common Ancestor (BST)",
        category: "Trees",
        difficulty: "Medium",
        trick: "Both p,q < node → go left. Both > node → go right. Else current node is LCA.",
        approach: "BST property: navigate toward both targets. When they split, that's the LCA.",
        timeComplexity: "O(h)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
        code: `function lowestCommonAncestor(root, p, q) {
  while (root) {
    if (p.val < root.val && q.val < root.val) root = root.left;
    else if (p.val > root.val && q.val > root.val) root = root.right;
    else return root;
  }
}`,
      },
      {
        id: "validate-bst",
        title: "Validate BST",
        category: "Trees",
        difficulty: "Medium",
        trick: "Pass min/max bounds down. Each node must be strictly inside (min, max) range.",
        approach: "validate(node, min, max). Left subtree max=node.val. Right subtree min=node.val.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        leetcodeUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
        code: `function isValidBST(root, min=-Infinity, max=Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}`,
      },
      {
        id: "kth-smallest-bst",
        title: "Kth Smallest in BST",
        category: "Trees",
        difficulty: "Medium",
        trick: "Inorder BST gives sorted order. Count nodes during inorder traversal.",
        approach: "Iterative inorder: push left chain, pop, decrement k, if k===0 return val, go right.",
        timeComplexity: "O(h+k)",
        spaceComplexity: "O(h)",
        leetcodeUrl: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
        code: `function kthSmallest(root, k) {
  const stack = [];
  let cur = root;
  while (cur || stack.length) {
    while (cur) { stack.push(cur); cur = cur.left; }
    cur = stack.pop();
    if (--k === 0) return cur.val;
    cur = cur.right;
  }
}`,
      },
      {
        id: "right-side-view",
        title: "Binary Tree Right Side View",
        category: "Trees",
        difficulty: "Medium",
        trick: "BFS level order. Last node of each level is the rightmost visible node.",
        approach: "Level-order BFS. After processing each level, push last node val to result.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/binary-tree-right-side-view/",
        code: `function rightSideView(root) {
  if (!root) return [];
  const res = [], q = [root];
  while (q.length) {
    const size = q.length;
    for (let i = 0; i < size; i++) {
      const node = q.shift();
      if (i === size - 1) res.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
  }
  return res;
}`,
      },
      {
        id: "zigzag-traversal",
        title: "Zigzag Level Order Traversal",
        category: "Trees",
        difficulty: "Medium",
        trick: "BFS level order. Alternate direction flag. Odd levels push front (unshift), even push back.",
        approach: "Same as level order but toggle leftToRight flag. When false, unshift instead of push.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
        code: `function zigzagLevelOrder(root) {
  if (!root) return [];
  const res = [], q = [root];
  let left = true;
  while (q.length) {
    const level = [], size = q.length;
    for (let i = 0; i < size; i++) {
      const node = q.shift();
      left ? level.push(node.val) : level.unshift(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    res.push(level); left = !left;
  }
  return res;
}`,
      },
    ],
  },
  {
    id: "heap",
    name: "Heap / Priority Queue",
    emoji: "⛰️",
    color: "#f59e0b",
    questions: [
      {
        id: "k-largest-elements",
        title: "K Largest Elements",
        category: "Heap",
        difficulty: "Medium",
        trick: "Min-heap of size k. If new element > heap min → replace. Heap always holds k largest.",
        approach: "Use min-heap. After processing all: heap contains k largest elements.",
        timeComplexity: "O(n log k)",
        spaceComplexity: "O(k)",
        leetcodeUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
        code: `// JS uses sorted array as simple min-heap simulation
function findKLargest(nums, k) {
  const heap = nums.slice(0, k).sort((a,b) => a-b);
  for (let i = k; i < nums.length; i++) {
    if (nums[i] > heap[0]) {
      heap[0] = nums[i];
      heap.sort((a,b) => a-b); // re-heapify (simplified)
    }
  }
  return heap;
}`,
      },
      {
        id: "merge-k-lists",
        title: "Merge K Sorted Lists",
        category: "Heap",
        difficulty: "Hard",
        trick: "Min-heap of size k (one node per list). Always pop smallest, push its next node.",
        approach: "Push all list heads into min-heap. Pop min, add to result, push popped.next.",
        timeComplexity: "O(n log k)",
        spaceComplexity: "O(k)",
        leetcodeUrl: "https://leetcode.com/problems/merge-k-sorted-lists/",
        code: `// Simplified using sorted merge approach for clarity
function mergeKLists(lists) {
  const all = [];
  for (const l of lists) {
    let cur = l;
    while (cur) { all.push(cur.val); cur = cur.next; }
  }
  all.sort((a,b) => a-b);
  const dummy = {next:null}; let cur = dummy;
  for (const v of all) { cur.next = {val:v, next:null}; cur = cur.next; }
  return dummy.next;
}`,
      },
      {
        id: "k-closest-points",
        title: "K Closest Points to Origin",
        category: "Heap",
        difficulty: "Medium",
        trick: "Max-heap of size k by distance. Evict farthest when size exceeds k.",
        approach: "For each point compute dist². Keep max-heap of size k. Pop when > k.",
        timeComplexity: "O(n log k)",
        spaceComplexity: "O(k)",
        leetcodeUrl: "https://leetcode.com/problems/k-closest-points-to-origin/",
        code: `function kClosest(points, k) {
  return points
    .map(p => [p[0]*p[0]+p[1]*p[1], p])
    .sort((a,b) => a[0]-b[0])
    .slice(0, k)
    .map(x => x[1]);
}`,
      },
      {
        id: "kth-largest-stream",
        title: "Kth Largest Element in Stream",
        category: "Heap",
        difficulty: "Medium",
        trick: "Maintain min-heap of size k. Top of heap is always the kth largest.",
        approach: "Keep heap of size k. On add: push val, if size>k pop min. Return heap[0].",
        timeComplexity: "O(log k) per add",
        spaceComplexity: "O(k)",
        leetcodeUrl: "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
        code: `class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = nums.sort((a,b)=>a-b).slice(-k); // keep k largest
  }
  add(val) {
    this.heap.push(val);
    this.heap.sort((a,b)=>a-b);
    if (this.heap.length > this.k) this.heap.shift();
    return this.heap[0];
  }
}`,
      },
      {
        id: "median-finder",
        title: "Find Median from Data Stream",
        category: "Heap",
        difficulty: "Hard",
        trick: "Two heaps: maxHeap (lower half) and minHeap (upper half). Balance sizes differ by at most 1.",
        approach: "Add to maxHeap. Balance: if maxHeap.top > minHeap.top → move. Keep |sizes| ≤ 1.",
        timeComplexity: "O(log n) add, O(1) median",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/find-median-from-data-stream/",
        code: `// Concept shown with sorted array (heap lib needed for O(log n))
class MedianFinder {
  constructor() { this.data = []; }
  addNum(num) {
    let lo=0, hi=this.data.length;
    while(lo<hi){ const mid=(lo+hi)>>1; this.data[mid]<num?lo=mid+1:hi=mid; }
    this.data.splice(lo,0,num);
  }
  findMedian() {
    const n=this.data.length;
    return n%2 ? this.data[n>>1] : (this.data[n/2-1]+this.data[n/2])/2;
  }
}`,
      },
      {
        id: "task-scheduler",
        title: "Task Scheduler",
        category: "Heap",
        difficulty: "Medium",
        trick: "Greedy: always schedule most frequent task. Idle fills cooldown gaps.",
        approach: "Count frequencies. Most frequent task F: min time = (F-1)*(n+1)+tasks with max freq count.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/task-scheduler/",
        code: `function leastInterval(tasks, n) {
  const freq = Array(26).fill(0);
  for (const t of tasks) freq[t.charCodeAt(0)-65]++;
  const maxF = Math.max(...freq);
  const maxCount = freq.filter(f => f===maxF).length;
  return Math.max(tasks.length, (maxF-1)*(n+1)+maxCount);
}`,
      },
    ],
  },
  {
    id: "graph",
    name: "Graph",
    emoji: "🕸️",
    color: "#06b6d4",
    questions: [
      {
        id: "bfs-graph",
        title: "BFS (Graph)",
        category: "Graph",
        difficulty: "Easy",
        trick: "Queue + visited set. Process level by level. Good for shortest path in unweighted graphs.",
        approach: "Enqueue start, mark visited. Pop node, process, enqueue unvisited neighbors.",
        timeComplexity: "O(V+E)",
        spaceComplexity: "O(V)",
        leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
        code: `function bfs(graph, start) {
  const visited = new Set([start]), q = [start], res = [];
  while (q.length) {
    const node = q.shift();
    res.push(node);
    for (const nei of graph[node]) {
      if (!visited.has(nei)) { visited.add(nei); q.push(nei); }
    }
  }
  return res;
}`,
      },
      {
        id: "dfs-graph",
        title: "DFS (Graph)",
        category: "Graph",
        difficulty: "Easy",
        trick: "Stack (or recursion) + visited set. Go deep first. Backtrack when stuck.",
        approach: "Recursive: mark visited, recurse on unvisited neighbors. Or iterative with stack.",
        timeComplexity: "O(V+E)",
        spaceComplexity: "O(V)",
        leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
        code: `function dfs(graph, node, visited = new Set()) {
  visited.add(node);
  for (const nei of graph[node])
    if (!visited.has(nei)) dfs(graph, nei, visited);
  return visited;
}`,
      },
      {
        id: "number-of-islands",
        title: "Number of Islands",
        category: "Graph",
        difficulty: "Medium",
        trick: "DFS/BFS to sink each island (mark '1'→'0'). Count how many times you start a DFS.",
        approach: "For each '1' cell: DFS mark all connected '1's as '0'. Increment count.",
        timeComplexity: "O(m×n)",
        spaceComplexity: "O(m×n)",
        leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
        code: `function numIslands(grid) {
  let count = 0;
  function sink(i, j) {
    if (i<0||i>=grid.length||j<0||j>=grid[0].length||grid[i][j]!=='1') return;
    grid[i][j]='0';
    sink(i+1,j); sink(i-1,j); sink(i,j+1); sink(i,j-1);
  }
  for (let i=0;i<grid.length;i++)
    for (let j=0;j<grid[0].length;j++)
      if (grid[i][j]==='1') { sink(i,j); count++; }
  return count;
}`,
      },
      {
        id: "flood-fill",
        title: "Flood Fill",
        category: "Graph",
        difficulty: "Easy",
        trick: "DFS from source pixel. Only fill cells matching original color. Avoid infinite loop if newColor=oldColor.",
        approach: "Get original color. DFS: if out of bounds, wrong color, or already filled → return. Else fill and recurse 4-dir.",
        timeComplexity: "O(m×n)",
        spaceComplexity: "O(m×n)",
        leetcodeUrl: "https://leetcode.com/problems/flood-fill/",
        code: `function floodFill(image, sr, sc, color) {
  const orig = image[sr][sc];
  if (orig === color) return image;
  function dfs(r, c) {
    if (r<0||r>=image.length||c<0||c>=image[0].length||image[r][c]!==orig) return;
    image[r][c] = color;
    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
  }
  dfs(sr, sc);
  return image;
}`,
      },
      {
        id: "topological-sort",
        title: "Topological Sort (Kahn's BFS)",
        category: "Graph",
        difficulty: "Medium",
        trick: "Kahn's: in-degree array. Start from 0 in-degree nodes. BFS reduces neighbors' in-degrees.",
        approach: "Build in-degree map. Queue all 0-indegree nodes. Process: add to order, decrement neighbors, enqueue if 0.",
        timeComplexity: "O(V+E)",
        spaceComplexity: "O(V+E)",
        leetcodeUrl: "https://leetcode.com/problems/course-schedule-ii/",
        code: `function topoSort(numNodes, edges) {
  const inDeg = Array(numNodes).fill(0), adj = Array.from({length:numNodes},()=>[]);
  for (const [u,v] of edges) { adj[u].push(v); inDeg[v]++; }
  const q = [], order = [];
  for (let i=0;i<numNodes;i++) if(inDeg[i]===0) q.push(i);
  while (q.length) {
    const u = q.shift(); order.push(u);
    for (const v of adj[u]) if(--inDeg[v]===0) q.push(v);
  }
  return order.length===numNodes ? order : []; // [] = cycle
}`,
      },
      {
        id: "course-schedule",
        title: "Course Schedule (Cycle Detection)",
        category: "Graph",
        difficulty: "Medium",
        trick: "Topological sort: if we can order all nodes (no cycle) → all courses can finish.",
        approach: "Build graph + inDegree. Kahn's BFS. If processed nodes === numCourses → true.",
        timeComplexity: "O(V+E)",
        spaceComplexity: "O(V+E)",
        leetcodeUrl: "https://leetcode.com/problems/course-schedule/",
        code: `function canFinish(numCourses, prerequisites) {
  const inDeg = Array(numCourses).fill(0), adj = Array.from({length:numCourses},()=>[]);
  for (const [a,b] of prerequisites) { adj[b].push(a); inDeg[a]++; }
  const q = [];
  for (let i=0;i<numCourses;i++) if(inDeg[i]===0) q.push(i);
  let done = 0;
  while (q.length) {
    const u=q.shift(); done++;
    for (const v of adj[u]) if(--inDeg[v]===0) q.push(v);
  }
  return done===numCourses;
}`,
      },
      {
        id: "bipartite-graph",
        title: "Is Graph Bipartite?",
        category: "Graph",
        difficulty: "Medium",
        trick: "2-color with BFS/DFS. If a neighbor has the SAME color → not bipartite.",
        approach: "Color array. BFS: assign 0/1 alternately. If neighbor same color → return false.",
        timeComplexity: "O(V+E)",
        spaceComplexity: "O(V)",
        leetcodeUrl: "https://leetcode.com/problems/is-graph-bipartite/",
        code: `function isBipartite(graph) {
  const color = Array(graph.length).fill(-1);
  for (let i=0;i<graph.length;i++) {
    if (color[i]!==-1) continue;
    const q=[i]; color[i]=0;
    while(q.length) {
      const u=q.shift();
      for(const v of graph[u]) {
        if(color[v]===-1){color[v]=1-color[u];q.push(v);}
        else if(color[v]===color[u]) return false;
      }
    }
  }
  return true;
}`,
      },
      {
        id: "dijkstra",
        title: "Dijkstra's Shortest Path",
        category: "Graph",
        difficulty: "Medium",
        trick: "Greedy + min-heap. Always process the closest unvisited node. Relax neighbors.",
        approach: "dist[] = Infinity. Push (0, src) to heap. Pop min dist node, relax edges, push improvements.",
        timeComplexity: "O((V+E) log V)",
        spaceComplexity: "O(V+E)",
        leetcodeUrl: "https://leetcode.com/problems/network-delay-time/",
        code: `function dijkstra(graph, src) {
  const dist = Array(graph.length).fill(Infinity);
  dist[src] = 0;
  // [distance, node] — simulate min-heap with sorted array
  const heap = [[0, src]];
  while (heap.length) {
    heap.sort((a,b)=>a[0]-b[0]);
    const [d, u] = heap.shift();
    if (d > dist[u]) continue;
    for (const [v, w] of graph[u]) {
      if (dist[u]+w < dist[v]) { dist[v]=dist[u]+w; heap.push([dist[v],v]); }
    }
  }
  return dist;
}`,
      },
      {
        id: "union-find",
        title: "Union Find (DSU)",
        category: "Graph",
        difficulty: "Medium",
        trick: "Path compression + union by rank. find() flattens tree. union() connects roots.",
        approach: "parent[i]=i init. find: if parent[i]≠i, parent[i]=find(parent[i]). union: connect by rank.",
        timeComplexity: "O(α(n)) near O(1)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/number-of-provinces/",
        code: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({length:n},(_,i)=>i);
    this.rank = Array(n).fill(0);
  }
  find(x) {
    if (this.parent[x]!==x) this.parent[x]=this.find(this.parent[x]);
    return this.parent[x];
  }
  union(x,y) {
    const px=this.find(x), py=this.find(y);
    if(px===py) return false;
    this.rank[px]>=this.rank[py] ? this.parent[py]=px : this.parent[px]=py;
    if(this.rank[px]===this.rank[py]) this.rank[px]++;
    return true;
  }
}`,
      },
      {
        id: "kruskal",
        title: "Kruskal's MST",
        category: "Graph",
        difficulty: "Medium",
        trick: "Sort edges by weight. Add edge if it doesn't form a cycle (use Union-Find). Stop after V-1 edges.",
        approach: "Sort all edges. For each edge in order: union(u,v). If cycle skip. Collect V-1 edges.",
        timeComplexity: "O(E log E)",
        spaceComplexity: "O(V)",
        leetcodeUrl: "https://leetcode.com/problems/min-cost-to-connect-all-points/",
        code: `function kruskal(n, edges) {
  edges.sort((a,b)=>a[2]-b[2]);
  const uf = new UnionFind(n);
  let cost = 0, count = 0;
  for (const [u,v,w] of edges) {
    if (uf.union(u,v)) { cost+=w; count++; }
    if (count===n-1) break;
  }
  return count===n-1 ? cost : -1; // -1 = no MST
}`,
      },
    ],
  },
  // ── Dynamic Programming ──────────────────────────────────────────
  {
    id: "dp",
    name: "Dynamic Programming",
    emoji: "🧩",
    color: "#8b5cf6",
    questions: [
      {
        id: "climbing-stairs",
        title: "Climbing Stairs",
        category: "Dynamic Programming",
        difficulty: "Easy",
        trick: "Same as Fibonacci — dp[i] = dp[i-1] + dp[i-2]. Just two variables needed.",
        approach: "f(n) = f(n-1) + f(n-2). Use two vars and iterate.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/",
        code: `function climbStairs(n) {
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}`,
      },
      {
        id: "coin-change",
        title: "Coin Change",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "dp[i] = min coins for amount i. Try every coin: dp[i] = min(dp[i], dp[i-coin]+1).",
        approach: "Init dp array with Infinity. dp[0]=0. For each amount, try each coin.",
        timeComplexity: "O(amount × coins)",
        spaceComplexity: "O(amount)",
        leetcodeUrl: "https://leetcode.com/problems/coin-change/",
        code: `function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++)
    for (const c of coins)
      if (c <= i) dp[i] = Math.min(dp[i], dp[i - c] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      },
      {
        id: "longest-increasing-subsequence",
        title: "Longest Increasing Subsequence",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "dp[i] = LIS ending at i. For each j<i, if nums[j]<nums[i] → dp[i]=max(dp[i],dp[j]+1).",
        approach: "O(n²) DP or O(n log n) with patience sorting / binary search.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/longest-increasing-subsequence/",
        code: `function lengthOfLIS(nums) {
  const tails = [];
  for (const n of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      tails[mid] < n ? lo = mid + 1 : hi = mid;
    }
    tails[lo] = n;
  }
  return tails.length;
}`,
      },
      {
        id: "word-break",
        title: "Word Break",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "dp[i] = can we form s[0..i-1] from dict. dp[i] = any dp[j] && s[j..i] in dict.",
        approach: "Boolean DP array. For each i, check all j < i.",
        timeComplexity: "O(n² × m)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/word-break/",
        code: `function wordBreak(s, wordDict) {
  const set = new Set(wordDict);
  const dp = Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++)
    for (let j = 0; j < i; j++)
      if (dp[j] && set.has(s.slice(j, i))) { dp[i] = true; break; }
  return dp[s.length];
}`,
      },
      {
        id: "unique-paths",
        title: "Unique Paths",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "dp[r][c] = paths from top-left to (r,c). dp[r][c] = dp[r-1][c] + dp[r][c-1].",
        approach: "2D DP grid. First row/col all 1s. Fill rest by summing up + left.",
        timeComplexity: "O(m × n)",
        spaceComplexity: "O(m × n)",
        leetcodeUrl: "https://leetcode.com/problems/unique-paths/",
        code: `function uniquePaths(m, n) {
  const dp = Array.from({length: m}, () => Array(n).fill(1));
  for (let r = 1; r < m; r++)
    for (let c = 1; c < n; c++)
      dp[r][c] = dp[r-1][c] + dp[r][c-1];
  return dp[m-1][n-1];
}`,
      },
      {
        id: "house-robber",
        title: "House Robber",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "dp[i] = max loot at house i. Can't rob adjacent: dp[i] = max(dp[i-1], dp[i-2] + nums[i]).",
        approach: "Track two vars prev2, prev1. Update each step.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/house-robber/",
        code: `function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const n of nums) {
    [prev2, prev1] = [prev1, Math.max(prev1, prev2 + n)];
  }
  return prev1;
}`,
      },
      {
        id: "longest-common-subsequence",
        title: "Longest Common Subsequence",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "dp[i][j] = LCS of text1[0..i] & text2[0..j]. Match → +1, else max of skip one.",
        approach: "2D DP. If chars match: dp[i][j]=dp[i-1][j-1]+1, else max(dp[i-1][j], dp[i][j-1]).",
        timeComplexity: "O(m × n)",
        spaceComplexity: "O(m × n)",
        leetcodeUrl: "https://leetcode.com/problems/longest-common-subsequence/",
        code: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({length: m+1}, () => Array(n+1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = text1[i-1]===text2[j-1]
        ? dp[i-1][j-1]+1
        : Math.max(dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}`,
      },
      {
        id: "edit-distance",
        title: "Edit Distance",
        category: "Dynamic Programming",
        difficulty: "Hard",
        trick: "dp[i][j] = min ops to convert word1[0..i] to word2[0..j]. Insert/delete/replace = +1.",
        approach: "If chars match: dp[i][j]=dp[i-1][j-1]. Else 1+min(insert, delete, replace).",
        timeComplexity: "O(m × n)",
        spaceComplexity: "O(m × n)",
        leetcodeUrl: "https://leetcode.com/problems/edit-distance/",
        code: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i || j));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = word1[i-1]===word2[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}`,
      },
      {
        id: "0-1-knapsack",
        title: "0/1 Knapsack",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "dp[w] = max value at capacity w. Iterate weights in reverse to avoid reuse.",
        approach: "1D DP. For each item, iterate w from capacity down to item weight.",
        timeComplexity: "O(n × W)",
        spaceComplexity: "O(W)",
        leetcodeUrl: "https://leetcode.com/problems/partition-equal-subset-sum/",
        code: `function canPartition(nums) {
  const total = nums.reduce((s, n) => s + n, 0);
  if (total % 2) return false;
  const target = total / 2;
  const dp = Array(target + 1).fill(false);
  dp[0] = true;
  for (const n of nums)
    for (let w = target; w >= n; w--)
      dp[w] = dp[w] || dp[w - n];
  return dp[target];
}`,
      },
      {
        id: "palindromic-substrings",
        title: "Palindromic Substrings",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "Expand around center for each char (and pair). Count every valid expansion.",
        approach: "For each center (2n-1 centers), expand while s[l]===s[r], count each.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/palindromic-substrings/",
        code: `function countSubstrings(s) {
  let count = 0;
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) { count++; l--; r++; }
  }
  for (let i = 0; i < s.length; i++) { expand(i, i); expand(i, i+1); }
  return count;
}`,
      },
      {
        id: "decode-ways",
        title: "Decode Ways",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "dp[i] = ways to decode s[0..i-1]. 1-digit and 2-digit checks. '0' alone is invalid.",
        approach: "dp[0]=1, dp[1]= s[0]!='0'?1:0. For i≥2 check single and double digits.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/decode-ways/",
        code: `function numDecodings(s) {
  const n = s.length;
  const dp = Array(n + 1).fill(0);
  dp[0] = 1;
  dp[1] = s[0] !== '0' ? 1 : 0;
  for (let i = 2; i <= n; i++) {
    const one = +s[i-1], two = +s.slice(i-2, i);
    if (one >= 1) dp[i] += dp[i-1];
    if (two >= 10 && two <= 26) dp[i] += dp[i-2];
  }
  return dp[n];
}`,
      },
      {
        id: "maximal-square",
        title: "Maximal Square",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "dp[r][c] = side of largest square with bottom-right at (r,c). '1' → min(up,left,diag)+1.",
        approach: "If matrix[r][c]='1': dp[r][c]=min(dp[r-1][c], dp[r][c-1], dp[r-1][c-1])+1.",
        timeComplexity: "O(m × n)",
        spaceComplexity: "O(m × n)",
        leetcodeUrl: "https://leetcode.com/problems/maximal-square/",
        code: `function maximalSquare(matrix) {
  const m=matrix.length, n=matrix[0].length;
  const dp = Array.from({length:m+1},()=>Array(n+1).fill(0));
  let best = 0;
  for (let r=1;r<=m;r++) for (let c=1;c<=n;c++) {
    if (matrix[r-1][c-1]==='1') {
      dp[r][c]=Math.min(dp[r-1][c],dp[r][c-1],dp[r-1][c-1])+1;
      best=Math.max(best,dp[r][c]);
    }
  }
  return best*best;
}`,
      },
      {
        id: "burst-balloons",
        title: "Burst Balloons",
        category: "Dynamic Programming",
        difficulty: "Hard",
        trick: "Think in reverse: last balloon to burst in range [l,r]. dp[l][r] = max coins if k is last.",
        approach: "Interval DP. dp[l][r] = max over k in (l,r): dp[l][k]+dp[k][r]+nums[l]*nums[k]*nums[r].",
        timeComplexity: "O(n³)",
        spaceComplexity: "O(n²)",
        leetcodeUrl: "https://leetcode.com/problems/burst-balloons/",
        code: `function maxCoins(nums) {
  nums = [1, ...nums, 1];
  const n = nums.length;
  const dp = Array.from({length:n},()=>Array(n).fill(0));
  for (let len=2; len<n; len++)
    for (let l=0; l<n-len; l++) {
      const r = l+len;
      for (let k=l+1; k<r; k++)
        dp[l][r]=Math.max(dp[l][r], dp[l][k]+dp[k][r]+nums[l]*nums[k]*nums[r]);
    }
  return dp[0][n-1];
}`,
      },
      {
        id: "min-path-sum",
        title: "Minimum Path Sum",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "dp[r][c] = min cost to reach (r,c). dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]).",
        approach: "Fill grid in-place or use DP table. First row/col init separately.",
        timeComplexity: "O(m × n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/minimum-path-sum/",
        code: `function minPathSum(grid) {
  const m=grid.length, n=grid[0].length;
  for (let r=0;r<m;r++) for (let c=0;c<n;c++) {
    if (r===0&&c===0) continue;
    const up = r>0 ? grid[r-1][c] : Infinity;
    const left = c>0 ? grid[r][c-1] : Infinity;
    grid[r][c] += Math.min(up, left);
  }
  return grid[m-1][n-1];
}`,
      },
      {
        id: "longest-palindromic-substring",
        title: "Longest Palindromic Substring",
        category: "Dynamic Programming",
        difficulty: "Medium",
        trick: "Expand around center (2n-1 centers). Track best start/len.",
        approach: "For each center, expand while equal chars. Record longest.",
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/longest-palindromic-substring/",
        code: `function longestPalindrome(s) {
  let start=0, maxLen=1;
  function expand(l,r) {
    while(l>=0&&r<s.length&&s[l]===s[r]){
      if(r-l+1>maxLen){maxLen=r-l+1;start=l;}
      l--;r++;
    }
  }
  for(let i=0;i<s.length;i++){expand(i,i);expand(i,i+1);}
  return s.slice(start,start+maxLen);
}`,
      },
    ],
  },
  // ── Backtracking ─────────────────────────────────────────────────
  {
    id: "backtracking",
    name: "Backtracking",
    emoji: "🔁",
    color: "#ec4899",
    questions: [
      {
        id: "subsets",
        title: "Subsets",
        category: "Backtracking",
        difficulty: "Medium",
        trick: "At each index: choose to include or not. DFS through all possibilities.",
        approach: "Backtrack: push current subset, then recurse with/without each remaining element.",
        timeComplexity: "O(2ⁿ)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/subsets/",
        code: `function subsets(nums) {
  const res = [];
  function bt(i, cur) {
    res.push([...cur]);
    for (let j = i; j < nums.length; j++) {
      cur.push(nums[j]);
      bt(j + 1, cur);
      cur.pop();
    }
  }
  bt(0, []);
  return res;
}`,
      },
      {
        id: "permutations",
        title: "Permutations",
        category: "Backtracking",
        difficulty: "Medium",
        trick: "Swap nums[i] with each nums[j≥i], recurse, swap back. Classic in-place.",
        approach: "At each position pick any remaining. Use visited array or swap-based.",
        timeComplexity: "O(n!)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/permutations/",
        code: `function permute(nums) {
  const res = [];
  function bt(start) {
    if (start === nums.length) { res.push([...nums]); return; }
    for (let i = start; i < nums.length; i++) {
      [nums[start], nums[i]] = [nums[i], nums[start]];
      bt(start + 1);
      [nums[start], nums[i]] = [nums[i], nums[start]];
    }
  }
  bt(0);
  return res;
}`,
      },
      {
        id: "combination-sum",
        title: "Combination Sum",
        category: "Backtracking",
        difficulty: "Medium",
        trick: "Can reuse candidates. DFS: subtract candidate from target. Base: target===0 → add.",
        approach: "Backtrack from index i, allowing reuse (recurse with same i).",
        timeComplexity: "O(2^(t/min))",
        spaceComplexity: "O(t/min)",
        leetcodeUrl: "https://leetcode.com/problems/combination-sum/",
        code: `function combinationSum(candidates, target) {
  const res = [];
  function bt(i, cur, rem) {
    if (rem === 0) { res.push([...cur]); return; }
    if (rem < 0 || i === candidates.length) return;
    cur.push(candidates[i]);
    bt(i, cur, rem - candidates[i]);
    cur.pop();
    bt(i + 1, cur, rem);
  }
  bt(0, [], target);
  return res;
}`,
      },
      {
        id: "n-queens",
        title: "N-Queens",
        category: "Backtracking",
        difficulty: "Hard",
        trick: "Track cols, diag1 (r-c), diag2 (r+c) sets. Place queen if none conflict.",
        approach: "Row by row, try each col. If safe (3 sets check), place and recurse.",
        timeComplexity: "O(n!)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/n-queens/",
        code: `function solveNQueens(n) {
  const res = [], cols = new Set(), d1 = new Set(), d2 = new Set();
  const board = Array.from({length:n}, () => Array(n).fill('.'));
  function bt(r) {
    if (r === n) { res.push(board.map(row => row.join(''))); return; }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(r-c) || d2.has(r+c)) continue;
      cols.add(c); d1.add(r-c); d2.add(r+c); board[r][c] = 'Q';
      bt(r + 1);
      cols.delete(c); d1.delete(r-c); d2.delete(r+c); board[r][c] = '.';
    }
  }
  bt(0);
  return res;
}`,
      },
      {
        id: "letter-combinations",
        title: "Letter Combinations of a Phone Number",
        category: "Backtracking",
        difficulty: "Medium",
        trick: "Map digit→letters. DFS: for each digit pick one letter, recurse to next digit.",
        approach: "Backtrack through digits. At each step try all mapped letters.",
        timeComplexity: "O(4ⁿ × n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
        code: `function letterCombinations(digits) {
  if (!digits) return [];
  const map = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'};
  const res = [];
  function bt(i, cur) {
    if (i === digits.length) { res.push(cur); return; }
    for (const c of map[digits[i]]) bt(i+1, cur+c);
  }
  bt(0, '');
  return res;
}`,
      },
      {
        id: "word-search",
        title: "Word Search",
        category: "Backtracking",
        difficulty: "Medium",
        trick: "DFS from each cell. Mark visited by temp char change. Restore on backtrack.",
        approach: "For each cell, DFS in 4 directions matching word chars. Mark & unmark visited.",
        timeComplexity: "O(m × n × 4^L)",
        spaceComplexity: "O(L)",
        leetcodeUrl: "https://leetcode.com/problems/word-search/",
        code: `function exist(board, word) {
  const m = board.length, n = board[0].length;
  function dfs(r, c, i) {
    if (i === word.length) return true;
    if (r<0||r>=m||c<0||c>=n||board[r][c]!==word[i]) return false;
    const tmp = board[r][c]; board[r][c] = '#';
    const found = dfs(r+1,c,i+1)||dfs(r-1,c,i+1)||dfs(r,c+1,i+1)||dfs(r,c-1,i+1);
    board[r][c] = tmp;
    return found;
  }
  for (let r=0;r<m;r++) for (let c=0;c<n;c++) if (dfs(r,c,0)) return true;
  return false;
}`,
      },
      {
        id: "palindrome-partitioning",
        title: "Palindrome Partitioning",
        category: "Backtracking",
        difficulty: "Medium",
        trick: "DFS: at each index, try all substrings starting here. If palindrome → recurse rest.",
        approach: "Backtrack: for each end, if s[start..end] is palindrome, push and recurse from end+1.",
        timeComplexity: "O(n × 2ⁿ)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/palindrome-partitioning/",
        code: `function partition(s) {
  const res = [];
  function isPalin(l,r){ while(l<r) if(s[l++]!==s[r--]) return false; return true; }
  function bt(start, cur) {
    if (start === s.length) { res.push([...cur]); return; }
    for (let end = start; end < s.length; end++) {
      if (isPalin(start, end)) {
        cur.push(s.slice(start, end+1));
        bt(end+1, cur);
        cur.pop();
      }
    }
  }
  bt(0, []);
  return res;
}`,
      },
      {
        id: "sudoku-solver",
        title: "Sudoku Solver",
        category: "Backtracking",
        difficulty: "Hard",
        trick: "Try 1-9 in each empty cell. Check row/col/box. Backtrack if stuck.",
        approach: "Find next empty. Try each digit. If valid → place & recurse. If dead-end → reset & try next.",
        timeComplexity: "O(9^m) m=empty cells",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/sudoku-solver/",
        code: `function solveSudoku(board) {
  function isValid(r,c,ch) {
    for(let i=0;i<9;i++) {
      if(board[r][i]===ch||board[i][c]===ch) return false;
      const br=3*Math.floor(r/3)+Math.floor(i/3);
      const bc=3*Math.floor(c/3)+i%3;
      if(board[br][bc]===ch) return false;
    }
    return true;
  }
  function solve() {
    for(let r=0;r<9;r++) for(let c=0;c<9;c++) if(board[r][c]==='.') {
      for(let d=1;d<=9;d++) {
        const ch=String(d);
        if(isValid(r,c,ch)){ board[r][c]=ch; if(solve()) return true; board[r][c]='.'; }
      }
      return false;
    }
    return true;
  }
  solve();
}`,
      },
      {
        id: "generate-parentheses",
        title: "Generate Parentheses",
        category: "Backtracking",
        difficulty: "Medium",
        trick: "Add '(' if open < n. Add ')' if close < open. Stop when cur.length === 2n.",
        approach: "Backtrack with open/close counters. Valid state: open<=n, close<=open.",
        timeComplexity: "O(4ⁿ/√n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/generate-parentheses/",
        code: `function generateParenthesis(n) {
  const res = [];
  function bt(cur, open, close) {
    if (cur.length === 2*n) { res.push(cur); return; }
    if (open < n) bt(cur+'(', open+1, close);
    if (close < open) bt(cur+')', open, close+1);
  }
  bt('', 0, 0);
  return res;
}`,
      },
    ],
  },
  // ── Trie ─────────────────────────────────────────────────────────
  {
    id: "trie",
    name: "Trie",
    emoji: "🌲",
    color: "#14b8a6",
    questions: [
      {
        id: "implement-trie",
        title: "Implement Trie (Prefix Tree)",
        category: "Trie",
        difficulty: "Medium",
        trick: "Each node has children[26] + isEnd flag. insert/search/startsWith all traverse char by char.",
        approach: "TrieNode with children map. insert: create nodes. search: walk & check isEnd.",
        timeComplexity: "O(L) per operation",
        spaceComplexity: "O(L × n)",
        leetcodeUrl: "https://leetcode.com/problems/implement-trie-prefix-tree/",
        code: `class TrieNode { constructor() { this.c={}; this.end=false; } }
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(w) {
    let n = this.root;
    for (const c of w) { if (!n.c[c]) n.c[c]=new TrieNode(); n=n.c[c]; }
    n.end = true;
  }
  _walk(w) { let n=this.root; for(const c of w){if(!n.c[c])return null; n=n.c[c];} return n; }
  search(w) { const n=this._walk(w); return !!n?.end; }
  startsWith(p) { return !!this._walk(p); }
}`,
      },
      {
        id: "add-search-word",
        title: "Add and Search Word (with '.')",
        category: "Trie",
        difficulty: "Medium",
        trick: "Standard Trie + handle '.' by trying all children recursively.",
        approach: "Insert normally. Search: on '.', recurse all children for rest of pattern.",
        timeComplexity: "O(L) insert, O(26^L) worst search",
        spaceComplexity: "O(L × n)",
        leetcodeUrl: "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
        code: `class WordDictionary {
  constructor() { this.root = {}; }
  addWord(w) {
    let n = this.root;
    for (const c of w) { n[c] ??= {}; n = n[c]; }
    n['#'] = true;
  }
  search(w, node = this.root) {
    for (let i = 0; i < w.length; i++) {
      const c = w[i];
      if (c === '.') return Object.keys(node).filter(k=>k!=='#').some(k => this.search(w.slice(i+1), node[k]));
      if (!node[c]) return false;
      node = node[c];
    }
    return !!node['#'];
  }
}`,
      },
      {
        id: "word-search-ii",
        title: "Word Search II",
        category: "Trie",
        difficulty: "Hard",
        trick: "Build Trie from words. DFS board while walking Trie. Prune when no Trie path.",
        approach: "Insert all words into Trie. DFS from each cell, follow Trie. Collect at isEnd.",
        timeComplexity: "O(m × n × 4^L)",
        spaceComplexity: "O(total word chars)",
        leetcodeUrl: "https://leetcode.com/problems/word-search-ii/",
        code: `function findWords(board, words) {
  const root = {}, res = new Set();
  for (const w of words) {
    let n = root;
    for (const c of w) { n[c] ??= {}; n = n[c]; }
    n['$'] = w;
  }
  const m=board.length, n=board[0].length;
  function dfs(r,c,node) {
    if(r<0||r>=m||c<0||c>=n) return;
    const ch = board[r][c];
    if(!node[ch]) return;
    const next = node[ch];
    if(next['$']) res.add(next['$']);
    board[r][c]='#';
    dfs(r+1,c,next); dfs(r-1,c,next); dfs(r,c+1,next); dfs(r,c-1,next);
    board[r][c]=ch;
  }
  for(let r=0;r<m;r++) for(let c=0;c<n;c++) dfs(r,c,root);
  return [...res];
}`,
      },
      {
        id: "longest-word-dictionary",
        title: "Longest Word in Dictionary",
        category: "Trie",
        difficulty: "Easy",
        trick: "Insert all words into Trie. BFS/DFS only along paths where every prefix exists (isEnd=true).",
        approach: "Sort words. Insert each. During search, only extend nodes marked as end of word.",
        timeComplexity: "O(Σ word lengths)",
        spaceComplexity: "O(Σ word lengths)",
        leetcodeUrl: "https://leetcode.com/problems/longest-word-in-dictionary/",
        code: `function longestWord(words) {
  words.sort();
  const built = new Set(['']);
  let res = '';
  for (const w of words) {
    if (built.has(w.slice(0,-1))) {
      built.add(w);
      if (w.length > res.length) res = w;
    }
  }
  return res;
}`,
      },
      {
        id: "replace-words",
        title: "Replace Words",
        category: "Trie",
        difficulty: "Medium",
        trick: "Build Trie from roots. For each word, walk Trie until you hit a terminal root → replace.",
        approach: "Insert all roots. For each word: walk char by char; if isEnd reached, use that prefix.",
        timeComplexity: "O(Σ roots + Σ words)",
        spaceComplexity: "O(Σ roots)",
        leetcodeUrl: "https://leetcode.com/problems/replace-words/",
        code: `function replaceWords(dictionary, sentence) {
  const root = {};
  for (const w of dictionary) {
    let n = root;
    for (const c of w) { n[c] ??= {}; n = n[c]; }
    n['$'] = w;
  }
  return sentence.split(' ').map(word => {
    let n = root;
    for (const c of word) {
      if (!n[c]) break;
      n = n[c];
      if (n['$']) return n['$'];
    }
    return word;
  }).join(' ');
}`,
      },
    ],
  },
  // ── Bit Manipulation ─────────────────────────────────────────────
  {
    id: "bit-manipulation",
    name: "Bit Manipulation",
    emoji: "⚡",
    color: "#f59e0b",
    questions: [
      {
        id: "single-number",
        title: "Single Number",
        category: "Bit Manipulation",
        difficulty: "Easy",
        trick: "XOR cancels pairs: a^a=0, a^0=a. XOR all elements → the unique one remains.",
        approach: "Reduce with XOR. Pairs cancel, lone number survives.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/single-number/",
        code: `function singleNumber(nums) {
  return nums.reduce((acc, n) => acc ^ n, 0);
}`,
      },
      {
        id: "count-bits",
        title: "Counting Bits",
        category: "Bit Manipulation",
        difficulty: "Easy",
        trick: "dp[i] = dp[i >> 1] + (i & 1). Right shift removes LSB, LSB is 0 or 1.",
        approach: "Build dp array: bits[i] = bits[i/2] + i%2 for all i up to n.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/counting-bits/",
        code: `function countBits(n) {
  const dp = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);
  return dp;
}`,
      },
      {
        id: "reverse-bits",
        title: "Reverse Bits",
        category: "Bit Manipulation",
        difficulty: "Easy",
        trick: "Shift result left, take LSB of n (n&1), shift n right. Repeat 32 times.",
        approach: "Loop 32 times: res = (res<<1)|(n&1), n>>>=1.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/reverse-bits/",
        code: `function reverseBits(n) {
  let res = 0;
  for (let i = 0; i < 32; i++) {
    res = (res * 2 + (n & 1)) >>> 0;
    n >>>= 1;
  }
  return res >>> 0;
}`,
      },
      {
        id: "missing-number",
        title: "Missing Number",
        category: "Bit Manipulation",
        difficulty: "Easy",
        trick: "XOR [0..n] with all nums. Pairs cancel, missing remains. Or: n*(n+1)/2 - sum.",
        approach: "XOR index and value. Or Gauss formula: expected - actual sum.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/missing-number/",
        code: `function missingNumber(nums) {
  let res = nums.length;
  for (let i = 0; i < nums.length; i++) res ^= i ^ nums[i];
  return res;
}`,
      },
      {
        id: "power-of-two",
        title: "Power of Two",
        category: "Bit Manipulation",
        difficulty: "Easy",
        trick: "Power of 2 has exactly one bit set. n & (n-1) clears that bit → 0. Also n>0.",
        approach: "Check n>0 && (n & (n-1)) === 0.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/power-of-two/",
        code: `function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}`,
      },
      {
        id: "sum-of-two-integers",
        title: "Sum of Two Integers (No +/-)",
        category: "Bit Manipulation",
        difficulty: "Medium",
        trick: "XOR = sum without carry. AND<<1 = carry. Repeat until no carry.",
        approach: "While b≠0: carry=(a&b)<<1, a=a^b, b=carry.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/sum-of-two-integers/",
        code: `function getSum(a, b) {
  while (b) {
    const carry = (a & b) << 1;
    a = a ^ b;
    b = carry;
  }
  return a;
}`,
      },
    ],
  },
  // ── Intervals ────────────────────────────────────────────────────
  {
    id: "intervals",
    name: "Intervals",
    emoji: "📏",
    color: "#22c55e",
    questions: [
      {
        id: "merge-intervals",
        title: "Merge Intervals",
        category: "Intervals",
        difficulty: "Medium",
        trick: "Sort by start. If next.start <= cur.end → merge (extend end). Else push new.",
        approach: "Sort intervals by start. Iterate merging overlapping ones.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/merge-intervals/",
        code: `function merge(intervals) {
  intervals.sort((a,b) => a[0]-b[0]);
  const res = [intervals[0]];
  for (const [s,e] of intervals.slice(1)) {
    const last = res[res.length-1];
    if (s <= last[1]) last[1] = Math.max(last[1], e);
    else res.push([s, e]);
  }
  return res;
}`,
      },
      {
        id: "insert-interval",
        title: "Insert Interval",
        category: "Intervals",
        difficulty: "Medium",
        trick: "Three phases: add all before new interval, merge overlapping, add remaining.",
        approach: "While end < newStart → push. While start <= newEnd → expand. Push rest.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/insert-interval/",
        code: `function insert(intervals, [ns, ne]) {
  const res = [];
  let i = 0;
  while (i < intervals.length && intervals[i][1] < ns) res.push(intervals[i++]);
  while (i < intervals.length && intervals[i][0] <= ne) {
    ns = Math.min(ns, intervals[i][0]);
    ne = Math.max(ne, intervals[i++][1]);
  }
  res.push([ns, ne]);
  while (i < intervals.length) res.push(intervals[i++]);
  return res;
}`,
      },
      {
        id: "non-overlapping-intervals",
        title: "Non-Overlapping Intervals",
        category: "Intervals",
        difficulty: "Medium",
        trick: "Sort by end. Greedy: keep interval with earliest end. Remove overlapping ones.",
        approach: "Sort by end. Track prevEnd. If start < prevEnd → remove (count++), else update prevEnd.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/non-overlapping-intervals/",
        code: `function eraseOverlapIntervals(intervals) {
  intervals.sort((a,b) => a[1]-b[1]);
  let count = 0, prevEnd = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= prevEnd) prevEnd = e;
    else count++;
  }
  return count;
}`,
      },
      {
        id: "meeting-rooms-ii",
        title: "Meeting Rooms II",
        category: "Intervals",
        difficulty: "Medium",
        trick: "Min-heap of end times. Sort by start. If room free (heap.min <= start) reuse it.",
        approach: "Sort by start. Use min-heap of end times. At each meeting either pop+push or just push.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/meeting-rooms-ii/",
        code: `// Using sorted arrays (no heap library)
function minMeetingRooms(intervals) {
  const starts = intervals.map(i=>i[0]).sort((a,b)=>a-b);
  const ends = intervals.map(i=>i[1]).sort((a,b)=>a-b);
  let rooms = 0, ep = 0;
  for (let i = 0; i < intervals.length; i++) {
    if (starts[i] < ends[ep]) rooms++;
    else ep++;
  }
  return rooms;
}`,
      },
      {
        id: "minimum-arrows",
        title: "Minimum Number of Arrows to Burst Balloons",
        category: "Intervals",
        difficulty: "Medium",
        trick: "Sort by end. Arrow at current end bursts all overlapping. Only move arrow when gap found.",
        approach: "Sort by end. Track arrowPos = first end. If next start > arrowPos → new arrow.",
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/",
        code: `function findMinArrowShots(points) {
  points.sort((a,b) => a[1]-b[1]);
  let arrows = 1, end = points[0][1];
  for (const [s,e] of points.slice(1)) {
    if (s > end) { arrows++; end = e; }
  }
  return arrows;
}`,
      },
      {
        id: "interval-list-intersections",
        title: "Interval List Intersections",
        category: "Intervals",
        difficulty: "Medium",
        trick: "Two pointers on both lists. Intersection = [max(starts), min(ends)] if valid. Advance list with smaller end.",
        approach: "i,j pointers. Compute overlap. If valid push. Advance pointer with smaller end.",
        timeComplexity: "O(m + n)",
        spaceComplexity: "O(m + n)",
        leetcodeUrl: "https://leetcode.com/problems/interval-list-intersections/",
        code: `function intervalIntersection(A, B) {
  const res = [];
  let i = 0, j = 0;
  while (i < A.length && j < B.length) {
    const lo = Math.max(A[i][0], B[j][0]);
    const hi = Math.min(A[i][1], B[j][1]);
    if (lo <= hi) res.push([lo, hi]);
    A[i][1] < B[j][1] ? i++ : j++;
  }
  return res;
}`,
      },
    ],
  },
  // ── Greedy ───────────────────────────────────────────────────────
  {
    id: "greedy",
    name: "Greedy",
    emoji: "💰",
    color: "#f97316",
    questions: [
      {
        id: "jump-game",
        title: "Jump Game",
        category: "Greedy",
        difficulty: "Medium",
        trick: "Track max reachable index. If i > maxReach → can't proceed. If maxReach >= n-1 → true.",
        approach: "Greedily extend maxReach = max(maxReach, i+nums[i]). Stop early if stuck.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/jump-game/",
        code: `function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}`,
      },
      {
        id: "jump-game-ii",
        title: "Jump Game II",
        category: "Greedy",
        difficulty: "Medium",
        trick: "BFS levels: at each 'level' (jump), track farthest reachable. Jump when you hit level end.",
        approach: "Track curEnd, farthest, jumps. When i===curEnd: jumps++, curEnd=farthest.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/jump-game-ii/",
        code: `function jump(nums) {
  let jumps = 0, curEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === curEnd) { jumps++; curEnd = farthest; }
  }
  return jumps;
}`,
      },
      {
        id: "gas-station",
        title: "Gas Station",
        category: "Greedy",
        difficulty: "Medium",
        trick: "If total gas >= total cost, solution exists. Start over when tank goes negative.",
        approach: "Track total and current tank. Reset start index when current < 0.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/gas-station/",
        code: `function canCompleteCircuit(gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    total += gas[i] - cost[i];
    tank += gas[i] - cost[i];
    if (tank < 0) { start = i + 1; tank = 0; }
  }
  return total >= 0 ? start : -1;
}`,
      },
      {
        id: "task-scheduler",
        title: "Task Scheduler",
        category: "Greedy",
        difficulty: "Medium",
        trick: "Most frequent task drives the answer. Slots = (maxCount-1)*(n+1) + countOfMaxFreq.",
        approach: "Count frequencies. Formula: max(tasks.length, (maxFreq-1)*(n+1)+maxFreqCount).",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/task-scheduler/",
        code: `function leastInterval(tasks, n) {
  const freq = Array(26).fill(0);
  for (const t of tasks) freq[t.charCodeAt(0)-65]++;
  freq.sort((a,b)=>b-a);
  const maxFreq = freq[0];
  let maxCount = freq.filter(f => f === maxFreq).length;
  return Math.max(tasks.length, (maxFreq - 1) * (n + 1) + maxCount);
}`,
      },
      {
        id: "partition-labels",
        title: "Partition Labels",
        category: "Greedy",
        difficulty: "Medium",
        trick: "Track last index of each char. Extend current partition to max last seen. When end reached → new partition.",
        approach: "Map each char to its last index. Scan: extend end = max(end, last[c]). When i===end push size.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/partition-labels/",
        code: `function partitionLabels(s) {
  const last = {};
  for (let i = 0; i < s.length; i++) last[s[i]] = i;
  const res = [];
  let start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s[i]]);
    if (i === end) { res.push(end - start + 1); start = i + 1; }
  }
  return res;
}`,
      },
      {
        id: "candy",
        title: "Candy",
        category: "Greedy",
        difficulty: "Hard",
        trick: "Two passes: L→R give +1 if higher than left. R→L take max of right+1 if higher.",
        approach: "Init all 1s. Left pass: if rating[i]>rating[i-1] candy[i]=candy[i-1]+1. Right pass same.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        leetcodeUrl: "https://leetcode.com/problems/candy/",
        code: `function candy(ratings) {
  const n = ratings.length;
  const c = Array(n).fill(1);
  for (let i=1;i<n;i++) if(ratings[i]>ratings[i-1]) c[i]=c[i-1]+1;
  for (let i=n-2;i>=0;i--) if(ratings[i]>ratings[i+1]) c[i]=Math.max(c[i],c[i+1]+1);
  return c.reduce((s,v)=>s+v,0);
}`,
      },
      {
        id: "majority-element",
        title: "Majority Element (Boyer-Moore)",
        category: "Greedy",
        difficulty: "Easy",
        trick: "Boyer-Moore Voting: candidate cancels out with opponents. Majority always survives.",
        approach: "Track candidate and count. If count===0 set new candidate. Increment if same, decrement if diff.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        leetcodeUrl: "https://leetcode.com/problems/majority-element/",
        code: `function majorityElement(nums) {
  let candidate = nums[0], count = 1;
  for (let i = 1; i < nums.length; i++) {
    if (count === 0) { candidate = nums[i]; count = 1; }
    else count += nums[i] === candidate ? 1 : -1;
  }
  return candidate;
}`,
      },
    ],
  },
]; // end DSA_CATEGORIES
