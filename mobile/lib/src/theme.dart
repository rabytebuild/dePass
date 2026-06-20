import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static ThemeData lightTheme() {
    final base = ThemeData.light();

    return base.copyWith(
      colorScheme: base.colorScheme.copyWith(
        primary: const Color(0xFFFA3E2C),
        secondary: const Color(0xFF1B1B18),
        background: const Color(0xFFF4F1ED),
        surface: Colors.white,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
      ),
      scaffoldBackgroundColor: const Color(0xFFF4F1ED),
      appBarTheme: AppBarTheme(
        backgroundColor: const Color(0xFF1B1B18),
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
      textTheme: GoogleFonts.interTextTheme(base.textTheme).copyWith(
        bodyLarge: GoogleFonts.inter(fontSize: 16, color: const Color(0xFF1B1B18)),
        bodyMedium: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF4B4A45)),
        titleLarge: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700),
        labelLarge: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFFA3E2C),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          textStyle: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        labelStyle: GoogleFonts.inter(color: const Color(0xFF4B4A45)),
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        margin: const EdgeInsets.symmetric(vertical: 8),
      ),
    );
  }
}
