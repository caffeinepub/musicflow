import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module Song {
    public func compare(song1 : Song, song2 : Song) : Order.Order {
      Nat.compare(song1.id, song2.id);
    };
  };

  type Song = {
    id : Nat;
    title : Text;
    artist : Text;
    duration : Nat;
    audioUrl : Text;
    coverUrl : Text;
  };

  type LyricLine = {
    timeSeconds : Float;
    text : Text;
  };

  type UserStats = {
    var playCounts : Map.Map<Nat, Nat>;
    var favorites : Set.Set<Nat>;
    var totalSeconds : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  let songs = Map.empty<Nat, Song>();
  let lyrics = Map.empty<Nat, [LyricLine]>();
  let userStats = Map.empty<Principal, UserStats>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func getOrCreateStats(user : Principal) : UserStats {
    switch (userStats.get(user)) {
      case (?stats) { stats };
      case (null) {
        let newStats : UserStats = {
          var playCounts = Map.empty<Nat, Nat>();
          var favorites = Set.empty<Nat>();
          var totalSeconds = 0;
        };
        userStats.add(user, newStats);
        newStats;
      };
    };
  };

  func getStatsReadOnly(user : Principal) : ?UserStats {
    userStats.get(user);
  };

  // Public query - accessible to all including guests
  public query ({ caller }) func getSongs() : async [Song] {
    songs.values().toArray().sort();
  };

  // User-specific data - requires user authentication
  public query ({ caller }) func getPlayCount(songId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view play counts");
    };
    switch (getStatsReadOnly(caller)) {
      case (?stats) {
        switch (stats.playCounts.get(songId)) {
          case (?count) { count };
          case (null) { 0 };
        };
      };
      case (null) { 0 };
    };
  };

  // User-specific data - requires user authentication
  public query ({ caller }) func getTotalSecondsListened() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view listening stats");
    };
    switch (getStatsReadOnly(caller)) {
      case (?stats) { stats.totalSeconds };
      case (null) { 0 };
    };
  };

  // Global stats - accessible to all including guests
  public query ({ caller }) func getTopPlayed() : async [Song] {
    let playCounts = Map.empty<Nat, Nat>();

    for ((user, stats) in userStats.entries()) {
      for ((songId, count) in stats.playCounts.entries()) {
        let current = switch (playCounts.get(songId)) {
          case (?c) { c };
          case (null) { 0 };
        };
        playCounts.add(songId, current + count);
      };
    };

    let allSongs = songs.values().toArray();
    let sortedSongs = allSongs.sort(
      func(a, b) {
        let countA = switch (playCounts.get(a.id)) {
          case (?c) { c };
          case (null) { 0 };
        };
        let countB = switch (playCounts.get(b.id)) {
          case (?c) { c };
          case (null) { 0 };
        };
        Nat.compare(countB, countA);
      }
    );
    sortedSongs.sliceToArray(0, Nat.min(10, sortedSongs.size()));
  };

  // User-specific data - requires user authentication
  public query ({ caller }) func getFavorites() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view favorites");
    };
    switch (getStatsReadOnly(caller)) {
      case (?stats) { stats.favorites.toArray() };
      case (null) { [] };
    };
  };

  // User-specific data - requires user authentication
  public query ({ caller }) func isFavorite(songId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check favorites");
    };
    switch (getStatsReadOnly(caller)) {
      case (?stats) { stats.favorites.contains(songId) };
      case (null) { false };
    };
  };

  // Public query - accessible to all including guests
  public query ({ caller }) func getLyrics(songId : Nat) : async [LyricLine] {
    switch (lyrics.get(songId)) {
      case (?lines) { lines };
      case (null) { [] };
    };
  };

  // Modifies user data - requires user authentication
  public shared ({ caller }) func recordPlay(songId : Nat, secondsListened : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record plays");
    };
    let stats = getOrCreateStats(caller);
    let currentCount = switch (stats.playCounts.get(songId)) {
      case (?count) { count };
      case (null) { 0 };
    };
    stats.playCounts.add(songId, currentCount + 1);
    stats.totalSeconds += secondsListened;
  };

  // Modifies user data - requires user authentication
  public shared ({ caller }) func toggleFavorite(songId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle favorites");
    };
    let stats = getOrCreateStats(caller);
    if (stats.favorites.contains(songId)) {
      stats.favorites.remove(songId);
    } else {
      stats.favorites.add(songId);
    };
  };

  // Initialize each song and its lyrics
  let song1 = {
    id = 1;
    title = "Sunshine";
    artist = "The Rays";
    duration = 210;
    audioUrl = "https://audio1.com";
    coverUrl = "https://cover1.com";
  };
  songs.add(1, song1);
  lyrics.add(
    1,
    [
      { timeSeconds = 0.0; text = "Waking up to sunshine" },
      { timeSeconds = 30.0; text = "Feeling bright and fine" },
      { timeSeconds = 60.0; text = "Chasing all the gray clouds away" },
      { timeSeconds = 120.0; text = "Smiling as the day goes by" },
      { timeSeconds = 180.0; text = "Life is bright, oh my" },
    ],
  );

  let song2 = {
    id = 2;
    title = "Moonlight";
    artist = "Night Owls";
    duration = 180;
    audioUrl = "https://audio2.com";
    coverUrl = "https://cover2.com";
  };
  songs.add(2, song2);
  lyrics.add(
    2,
    [
      { timeSeconds = 0.0; text = "Under the moonlight sky" },
      { timeSeconds = 40.0; text = "Stars are shining bright" },
      { timeSeconds = 80.0; text = "Whispers in the night air" },
      { timeSeconds = 120.0; text = "Dancing shadows everywhere" },
      { timeSeconds = 160.0; text = "Magic in the midnight blue" },
    ],
  );

  let song3 = {
    id = 3;
    title = "River Flow";
    artist = "Waterways";
    duration = 240;
    audioUrl = "https://audio3.com";
    coverUrl = "https://cover3.com";
  };
  songs.add(3, song3);
  lyrics.add(
    3,
    [
      { timeSeconds = 0.0; text = "River flowing gently" },
      { timeSeconds = 60.0; text = "Carrying dreams downstream" },
      { timeSeconds = 120.0; text = "Ripples on the water's face" },
      { timeSeconds = 180.0; text = "Nature's endless grace" },
      { timeSeconds = 220.0; text = "Journey never ends" },
    ],
  );

  let song4 = {
    id = 4;
    title = "City Lights";
    artist = "Urban Dreamers";
    duration = 200;
    audioUrl = "https://audio4.com";
    coverUrl = "https://cover4.com";
  };
  songs.add(4, song4);
  lyrics.add(
    4,
    [
      { timeSeconds = 0.0; text = "City lights shining bright" },
      { timeSeconds = 50.0; text = "Neon signs in the night" },
      { timeSeconds = 100.0; text = "Hustle and the glow" },
      { timeSeconds = 150.0; text = "People come and go" },
      { timeSeconds = 190.0; text = "Dreams alive in the cityscape" },
    ],
  );
};
